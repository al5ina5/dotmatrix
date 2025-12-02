/**
 * Screen Hydration Hook
 * 
 * Hydrates screens with plugin data:
 * - Multi-line screens: hydrates all rows
 * - Single-line screens: extracts as single row and hydrates
 * - Fullscreen screens: no hydration needed (they render directly)
 * 
 * Note: This hook extracts all rows from all screens and hydrates them together,
 * then maps them back to screens. This is necessary because React hooks must be
 * called unconditionally.
 */

import { useMemo } from 'react';
import { useDataHydration } from './useDataHydration';
import { ScreenConfig, MultiLineScreenConfig, SingleLineScreenConfig, isMultiLineScreen, isSingleLineScreen } from '@/types/screen';
import { HydratedRow } from './useDataHydration';
import { LEDRowConfig } from '@/config/led.config';

export interface HydratedScreen {
  screen: ScreenConfig;
  // For multi-line screens: hydrated rows
  rows?: HydratedRow[];
  // For single-line screens: hydrated content (as single row)
  hydratedRow?: HydratedRow;
}

/**
 * Hydrates screens with plugin data
 */
export function useScreenHydration(screens: ScreenConfig[]): HydratedScreen[] {
  // Extract all rows from all screens (for hydration)
  const allRows = useMemo(() => {
    const rows: { row: LEDRowConfig; screenIndex: number; rowIndex: number }[] = [];
    screens.forEach((screen, screenIndex) => {
      if (isMultiLineScreen(screen)) {
        screen.rows.forEach((row, rowIndex) => {
          rows.push({ row, screenIndex, rowIndex });
        });
      } else if (isSingleLineScreen(screen)) {
        // Convert single-line screen to a row for hydration
        rows.push({
          row: {
            pluginId: screen.pluginId,
            params: screen.params,
            stepInterval: screen.stepInterval,
            color: screen.color,
            scrolling: screen.scrolling,
            alignment: screen.alignment,
            spacing: screen.spacing
          },
          screenIndex,
          rowIndex: 0
        });
      }
    });
    return rows;
  }, [screens]);

  // Hydrate all rows at once
  const hydratedRows = useDataHydration(allRows.map(r => r.row));

  // Map hydrated rows back to screens
  return useMemo(() => {
    let hydratedRowIndex = 0;
    return screens.map((screen, screenIndex) => {
      if (isMultiLineScreen(screen)) {
        // Get hydrated rows for this multi-line screen
        const screenRows: HydratedRow[] = [];
        for (let i = 0; i < screen.rows.length; i++) {
          if (allRows[hydratedRowIndex]?.screenIndex === screenIndex && 
              allRows[hydratedRowIndex]?.rowIndex === i) {
            screenRows.push(hydratedRows[hydratedRowIndex]);
            hydratedRowIndex++;
          }
        }
        return {
          screen,
          rows: screenRows
        };
      } else if (isSingleLineScreen(screen)) {
        // Get hydrated row for this single-line screen
        const hydratedRow = hydratedRows[hydratedRowIndex];
        hydratedRowIndex++;
        return {
          screen,
          hydratedRow
        };
      } else {
        // Fullscreen screens don't need hydration
        return {
          screen
        };
      }
    });
  }, [screens, hydratedRows, allRows]);
}

