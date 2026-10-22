import Phaser from 'phaser';

// Fælles, diskret udseende til dialogfelter og valgknapper.
export default function roundedPanel(scene, x, y, width, height, color = 0x29343d) {
  const panel = scene.add.graphics({ x, y });
  let fill = color;
  let border = 0x73878b;
  let borderWidth = 1;
  const draw = () => {
    panel.clear();
    panel.fillStyle(0x000000, 0.22);
    panel.fillRoundedRect(-width / 2, -height / 2 + 4, width, height, 12);
    panel.fillStyle(fill, 0.97);
    panel.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    panel.lineStyle(borderWidth, border, 0.8);
    panel.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
  };
  panel.setFillStyle = value => {
    fill = value;
    draw();
    return panel;
  };
  panel.setStrokeStyle = (thickness, value) => {
    borderWidth = thickness;
    border = value;
    draw();
    return panel;
  };
  panel.setPanelSize = (newWidth, newHeight) => {
    width = newWidth;
    height = newHeight;
    panel.input.hitArea.setTo(-width / 2, -height / 2, width, height);
    draw();
    return panel;
  };
  panel.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
    Phaser.Geom.Rectangle.Contains);
  panel.input.cursor = 'pointer';
  panel.disableInteractive();
  draw();
  return panel;
}
