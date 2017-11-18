function Note(tittle, message) {
    this.message = message;
    this.tittle = tittle;
}

function Change(id, action, changes) {
    this.id = id;
    this.action = action;
    this.changes = changes;
}

function History() {
    var changes = [],
        hPointer = 0;

    return {
        addChange: function (change) {
            changes.push(change);
            hPointer++;
        },
        Undo: function () {}
    }
}

function NoteModel() {
    var noteHistory = new History(),
        notes = [];
    this.getHistory = function () {
        return history;
    }
    this.setHistory = function (update) {
        history = update;
    }
}

NoteModel.prototype.save = function () { };
NoteModel.prototype.edit = function () { };
NoteModel.prototype.delete = function () { };
NoteModel.prototype.redo = function () { };
NoteModel.prototype.undo = function () { };


var noteModel = new NoteModel();
var noteHistory = new History();
var note = new Note("tittle", "message");
var change = new Change(0, "edit", note);
noteHistory.addChange(change);
console.log(noteHistory.changes);