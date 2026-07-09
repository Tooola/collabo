import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { formatUser, roleFromClient } from '../utils/formatters';
export const authService = {
    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user)
            return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return null;
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, teamId: user.teamId?.toString() || null }, env.jwtSecret, { expiresIn: '7d' });
        return {
            user: formatUser(user),
            token
        };
    },
    async register(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await User.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: roleFromClient(data.role) ?? 'DEV',
            teamId: data.teamId || null
        });
        return formatUser(user);
    },
    async me(id) {
        const user = await User.findById(id);
        return user ? formatUser(user) : null;
    }
};
