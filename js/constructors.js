// Notes constructor
function Note(id, tittle, message, creationDate, order) {
    this.id = id;
    this.message = message;
    this.tittle = tittle;
    this.creationDate = creationDate.toLocaleString('en-US', { hour12: false });
    this.order = order;
}

// Change constructor those help to add changes into the history
function Change(action, changes) {
    this.action = action;
    this.changes = changes;
}

// History constructor hPointer = 'history pointer'
function History() {
    this.changes = [];
    this.hPointer = 0;
}

History.prototype.addChange = function (action, change) {
    if(action != "redo" || this.hPointer < this.changes.length)
    this.changes[this.hPointer] = change;

    if (action != "undo" && this.hPointer < this.changes.length) {
        this.hPointer++;
        if (action != "redo") {
            for (let index = this.hPointer, length = this.changes.length; index < length; index++) {
                delete this.changes[index];
            }
        }
    }
};

History.prototype.undo = function () {
    if (this.hPointer > 0) {
        return this.changes[--this.hPointer];
    }
};

History.prototype.redo = function () {
    if (this.hPointer < this.changes.length) {
        return this.changes[this.hPointer];
    }
};


// First, let's model the list of dependent Observers a subject may have:
function ObserverList() {
    this.observerList = [];
}
ObserverList.prototype.add = function (obj) {
    return this.observerList.push(obj);
};
ObserverList.prototype.count = function () {
    return this.observerList.length;
};
ObserverList.prototype.get = function (index) {
    if (index > -1 && index < this.observerList.length) {
        return this.observerList[index];
    }
};
ObserverList.prototype.indexOf = function (obj, startIndex) {
    var i = startIndex;
    while (i < this.observerList.length) {
        if (this.observerList[i] === obj) {
            return i;
        }
        i++;
    }
    return -1;
};
ObserverList.prototype.removeAt = function (index) {
    this.observerList.splice(index, 1);
};


// Next, let's model the Subject and the ability to add, remove or notify observers on the observer list.
function Subject() {
    this.observers = new ObserverList();
}
Subject.prototype.addObserver = function (observer) {
    this.observers.add(observer);
};
Subject.prototype.removeObserver = function (observer) {
    this.observers.removeAt(this.observers.indexOf(observer, 0));
};
Subject.prototype.notify = function (context) {
    var observerCount = this.observers.count();
    for (var i = 0; i < observerCount; i++) {
        this.observers.get(i).update(context);
    }
};


// We then define a skeleton for creating new Observers. The update functionality here will be overwritten later with custom behaviour.
// The Observer
function Observer() {
    this.update = function () {
        // ...
    };
}