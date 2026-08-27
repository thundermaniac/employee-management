/**
 * Chart colours, selected per mode rather than flipped automatically.
 *
 * - Department count is a single measure, so it uses one sequential blue hue
 *   (never one colour per bar — rank is not identity).
 * - Status is a state, so it uses reserved status colours, always shipped with
 *   a text label so meaning never rests on colour alone.
 */
export const chartPalette = (mode) =>
  mode === 'light'
    ? {
        primary: '#2a78d6',
        primarySoft: '#9ec5f4',
        status: { Active: '#0ca30c', 'On Leave': '#fab219', Inactive: '#8a8a80' },
      }
    : {
        primary: '#3987e5',
        primarySoft: '#1c5cab',
        status: { Active: '#0ca30c', 'On Leave': '#fab219', Inactive: '#9a9a90' },
      };
