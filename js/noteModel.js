var noteModel = (function () {
    var noteHistory = new History(),
        notes = { last: 0 }

    addChange = function (change) {
        noteHistory.addChange(change);
    },


        save = function (note) {
            // save note
            notes[note.id] = note;
            // registing the note
            localStorage.setItem("notes", JSON.stringify(notes));
        }

    return {
        init: function () {
            if (!localStorage.getItem("notes")) {
                localStorage.setItem("notes", '{"notes":{}}');
            }
            notes = JSON.parse(localStorage.getItem("notes"));
        },
        debug: function () {
            console.log(notes);
            console.log(noteHistory);
        },
        getNotes: function () {
            var args = Array.from(arguments),
                length = args.length
            var send = [];
            if (length > 0) {
                for (var index = 0; index < length; index++) {
                    send.push(notes[args[index]]);
                }
            }
            else {
                for (var key in notes) {
                    if (notes.hasOwnProperty(key) && key != "last") {
                        send.push(notes[key]);
                    }
                }
            }
            return send;
        },
        genID: function () {
            return ++notes['last'];
        },
        create: function (note) {
            addChange(new Change("create", note.id));
            save(note);
        },
        ordering: function (noteschanged) {
            var beforeOrder = [];
            noteschanged.forEach(function (data) {
                var note = Object.assign({}, notes[data.id]);
                beforeOrder.push({id: note.id,order: note.order})
                note.order = data.order;
                save(note);
            });

            addChange(new Change("ordering", beforeOrder));
        },
        edit: function (data) {
            // finding the note
            var note = Object.assign({}, notes[data.id]),
                hadChange = false;

            // Comparing if the data change and replacing the note
            for (var key in data) {
                if (data.hasOwnProperty(key) && key != "editionDate" && note[key] != data[key]) {
                    note[key] = data[key];
                    hadChange = true;
                }
            }

            if (hadChange) {
                note["editionDate"] = data["editionDate"] ? data["editionDate"] : note["editionDate"];
                addChange(new Change("edit", Object.assign({}, notes[data.id])));
                // saving the note
                save(note);
            }

            // returning the note to display
            return hadChange;
        },
        delete: function (id) {
            var note = Object.assign({}, notes[id]);
            delete notes[id];
            isEmpty = true;
            for (var key in notes) {
                if (key !== "last" && notes[key]) {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty) {
                notes["last"] = 0;
            }

            addChange(new Change("delete", Object.assign({}, note)));
        },
        redo: function () { },
        undo: function () {
            return changes = noteHistory.undo();
        }
    }
})();