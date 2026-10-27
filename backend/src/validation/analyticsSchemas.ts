import { z } from 'zod';
import { ANALYSIS_TYPES } from '../services/analyticsService';

export const analysisTypeSchema = z.enum(ANALYSIS_TYPES);

/**
 * `group_by` n'accepte que les colonnes catégorielles réellement déclarées
 * sur le jeu visé : envoyer une colonne absente ne casse rien côté API (soft
 * contract), mais produirait un bloc vide inutile.
 */

export const fluxRunSchema = z.object({
  analysis: z.array(analysisTypeSchema).optional(),
  includeAi: z.boolean().optional()
});

export const tachesRunSchema = z.object({
  analysis: z.array(analysisTypeSchema).optional(),
  groupBy: z.enum(['statut', 'projet', 'equipe', 'responsable', 'niveau']).optional(),
  includeAi: z.boolean().optional()
});

export const projetsRunSchema = z.object({
  analysis: z.array(analysisTypeSchema).optional(),
  groupBy: z.enum(['statut', 'equipe']).optional(),
  includeAi: z.boolean().optional()
});

export const syntheseRunSchema = z.object({
  analysis: z.array(analysisTypeSchema).optional(),
  groupBy: z.enum(['statut', 'projet', 'equipe']).optional(),
  includeAi: z.boolean().optional()
});
