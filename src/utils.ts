namespace LCB {
  export namespace Utils {
    export function drawVerticalLine(
      ctx: Context2D,
      left: number,
      top: number,
      width: number,
      color: string
    ): void {
      ctx.fillStyle = color;
      ctx.fillRect(left, top, 1, width);
    }

    export function drawHorizontalLine(
      ctx: Context2D,
      left: number,
      top: number,
      width: number,
      color: string
    ) {
      ctx.fillStyle = color;
      ctx.fillRect(left, top, width, 1);
    }

    export function drawRectLine(
      ctx: Context2D,
      left: number,
      top: number,
      width: number,
      height: number,
      color: string
    ): void {
      drawHorizontalLine(ctx, left, top, width, color);
      drawHorizontalLine(ctx, left, top + height, width, color);
      drawVerticalLine(ctx, left, top, height, color);
      drawVerticalLine(ctx, left + width, top, height, color);
    }
  }
}
