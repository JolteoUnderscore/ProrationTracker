var foo = document.getElementById('foo');

const character = {
    '2C' : {
        data: "foo"
    },
    '5C' : {
        data: "foo"
    },
    '22A' : {
        data: "foo"
    }
}
var combolist = document.getElementById('combolist');
var innerlist = document.createElement('div');
innerlist.className = 'list';
for (let i in character) {
    let d = document.createElement('div');
    d.className = 'item';
    d.innerHTML = i;
    innerlist.appendChild(d);
}
combolist.appendChild(innerlist);
console.log(innerlist.childNodes)

new Sortable(innerlist, {
    group: {
        name: 'combo',
        pull: 'clone',
        put: false
    },
    sort: false,
    animation: 100
});

$('#foo').data('dataname', {foo:'bar'})
console.log($('#foo').data('dataname'))

new Sortable(foo, {
    group: {
        name: 'combo'
    },
    removeOnSpill: true,
    ghostClass: 'blue-background-class',
    animation: 100
});