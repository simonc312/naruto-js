class Game {
  constructor() {
    this.onePlayerMode = true; 
    this.gameOver = false;
    this.bossMode = false;
    this.score = 0;
    this.killCount = 0;
  }

  isOnePlayerMode() {
    return this.onePlayerMode;
  }

  isGameOver() {
    return this.gameOver;
  }

  isBossMode() {
    return this.bossMode;
  }
  //move to Player model
  getScore() {
    return this.score;
  }

  getKillCount() {
    return this.killCount;
  }

  setPlayerMode(isOnePlayer) {
    this.onePlayerMode = isOnePlayer;
  }

  setGameOver(isGameOver) {
    this.gameOver = isGameOver;
  }

  setBossMode(isBossMode) {
    this.bossMode = isBossMode;
  }

  updateScore(amount) {
    this.score += amount;
  }

  updateKillCount(amount) {
    this.killCount += amount;
  }
}

module.exports = {
  game : Game
}