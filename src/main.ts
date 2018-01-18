window.addEventListener("load", function() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const m = new LCB.Manager();

    const b1 = new LCB.Box();
    b1.setRect({ top: 100, left: 100 });
    b1.setFunction(function(ctx, rect, box) {
      ctx.font = "18px serif";
      ctx.fillText(
        "hello, world",
        rect.left + rect.width / 2 - 20,
        rect.top + rect.height / 2
      );
    });
    m.add(b1);

    const b2 = new LCB.Box();
    b2.setRect({ top: 200, left: 300 });
    b2.setFunction(function(ctx, rect, box) {
      ctx.beginPath();
      ctx.arc(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        50,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "yellow";
      ctx.fill();
      ctx.font = "18px serif";
      ctx.fillStyle = "red";
      ctx.fillText(
        "hello, world",
        rect.left + rect.width / 2 - 20,
        rect.top + rect.height / 2
      );
    });
    m.add(b2);

    m.renderTo("canvas");
  }
});
