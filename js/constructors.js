// Notes constructor
function Note(id, tittle, message, creationDate, order) {
    this.id = id;
    this.message = message;
    this.tittle = tittle;
    this.creationDate = creationDate.toLocaleString('en-US', { hour12: false });
    this.order = order;
}

// Change constructor those help to add changes into the history
function Change(id, action, changes) {
    this.id = id;
    this.action = action;
    this.changes = changes;
}

// History constructor hPointer = 'history pointer'
function History() {
    this.changes = [];
    this.hPointer = 0;
}

History.prototype.addChange = function (change) {
    this.changes.push(change);
    this.hPointer++;
};
History.prototype.Undo = function () { }