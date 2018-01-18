namespace LCB {
  export namespace Utils {
    export function drawVerticalLine(
      ctx: Context2D,
      left: number,
      top: number,
      width: number,
      color: string,
      lineWidth: number = 1
    ): void {
      ctx.fillStyle = color;
      ctx.fillRect(left, top, lineWidth, width);
    }

    export function drawHorizontalLine(
      ctx: Context2D,
      left: number,
      top: number,
      width: number,
      color: string,
      lineWidth: number = 1
    ) {
      ctx.fillStyle = color;
      ctx.fillRect(left, top, width, lineWidth);
    }

    export function drawRectLine(
      ctx: Context2D,
      left: number,
      top: number,
      width: number,
      height: number,
      color: string,
      lineWidth: number = 1
    ): void {
      drawHorizontalLine(ctx, left, top, width, color, lineWidth);
      drawHorizontalLine(ctx, left, top + height, width, color, lineWidth);
      drawVerticalLine(ctx, left, top, height, color, lineWidth);
      drawVerticalLine(ctx, left + width, top, height, color, lineWidth);
    }

    export function getRectCenter(rect: Rect): Point {
      const hw = rect.width / 2;
      const hh = rect.height / 2;
      return { left: rect.left + hw, top: rect.top + hh };
    }

    export function pointInsideRect(
      left: number,
      top: number,
      rect: Rect
    ): boolean {
      if (left < rect.left) return false;
      if (left > rect.left + rect.width) return false;
      if (top < rect.top) return false;
      if (top > rect.top + rect.height) return false;
      return true;
    }

    export function pointInsideCorner(
      left: number,
      top: number,
      corners: Corners
    ): CornerName | undefined {
      if (pointInsideRect(left, top, corners.leftTop)) return "leftTop";
      if (pointInsideRect(left, top, corners.leftBottom)) return "leftBottom";
      if (pointInsideRect(left, top, corners.rightTop)) return "rightTop";
      if (pointInsideRect(left, top, corners.rightBottom)) return "rightBottom";
    }

    export function resizeRectByCornerName(
      rect: Rect,
      cornerName: CornerName,
      movementX: number,
      movementY: number
    ): void {
      switch (cornerName) {
        case "leftTop":
          rect.left += movementX;
          rect.top += movementY;
          rect.width -= movementX;
          rect.height -= movementY;
          break;
        case "leftBottom":
          rect.left += movementX;
          rect.width -= movementX;
          rect.height += movementY;
          break;
        case "rightTop":
          rect.top += movementY;
          rect.width += movementX;
          rect.height -= movementY;
          break;
        case "rightBottom":
          rect.width += movementX;
          rect.height += movementY;
          break;
      }
    }
  }
}
