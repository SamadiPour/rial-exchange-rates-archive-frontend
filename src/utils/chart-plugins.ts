import { Chart, Plugin } from 'chart.js';

export const verticalHoverLine: Plugin<'line'> = {
  id: 'verticalHoverLine',
  beforeDatasetsDraw(
    chart: Chart<'line'>,
    args: { cancelable: boolean },
    plugins: Record<string, unknown>,
  ) {
    const {
      ctx,
      chartArea: { top, bottom },
    } = chart;
    ctx.save();
    chart.getDatasetMeta(0).data.forEach((dataPoint: any) => {
      if (dataPoint.active === true) {
        ctx.beginPath();
        ctx.strokeStyle = '#d3d3d3';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(dataPoint.x, top);
        ctx.lineTo(dataPoint.x, bottom);
        ctx.stroke();
      }
    });
    ctx.restore();
  },
};
