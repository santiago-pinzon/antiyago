export class CommandHistory {
    constructor(maxSize = 20) {
        this.history = [];
        this.maxSize = maxSize;
        this.currentIndex = -1;
    }

    // Add a command to the history
    addCommand(command) {
        if (this.history.length === this.maxSize) {
            this.history.shift();
        }
        this.history.push(command);
        this.currentIndex = this.history.length;
    }

    // Navigate backward through the history
    previousCommand() {
        if (this.currentIndex > 0) {
            this.currentIndex -= 1;
            return this.history[this.currentIndex];
        }
        return null;
    }

    // Navigate forward through the history
    nextCommand() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex += 1;
            return this.history[this.currentIndex];
        }
        return null;
    }

    // Get the current command
    currentCommand() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return this.history[this.currentIndex];
        }
        return null;
    }
}
