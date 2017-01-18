function createButton(text, handler) {
  let button = $("<button class='button'>" +text+ "</button>");
  button.click(handler);
  return button;
}

function createDialog(score, 
                      leftButtonHandler, 
                      leftButtonText,
                      rightButtonHandler,
                      rightButtonText) {
  let leftButton = createButton(leftButtonText, leftButtonHandler);
  let rightButton = createButton(rightButtonText, rightButtonHandler);
  let dialog = $("<div class='dialog'>" +
                    "<h4>Game Over</h4>" +
                    "Your final score was" + 
                    "<h3>" + score + "</h3>" + 
                    "Rank " + " Genin" + "<br>" +
                  "</div>");
  dialog.append(rightButton);
  dialog.append(leftButton);
  dialog.opacity = 0;
  return dialog;
}

function showDialog(rootContainer, 
                    score, 
                    leftButtonHandler, 
                    rightButtonHandler) {
  let gameOverDialog = createDialog(score, 
                                    leftButtonHandler, "Share",
                                    rightButtonHandler, "Retry");
  $(rootContainer).prepend(gameOverDialog);
  gameOverDialog.fadeIn();
}

module.exports = {
  show : showDialog
}