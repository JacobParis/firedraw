export default class UserList {
    
    constructor() {
        this.list = <ul class="user-list" />;
        this.users = {};
    }

    setCurrentPlayer(user) {
        if(this.currentUser === user) return;
        if(!this.users[user]) return;
        
        const previousUser = this.users[this.currentUser];
        if(previousUser) {
            previousUser.element.classList.remove("current");
        }

        this.users[user].element.classList.add("current");
        this.currentUser = user;
    }

    setUsers(users) {
        // Add new users
        for(let i in users) {
            const user = users[i];
            if(Reflect.has(this.users, user.name)) {
                // We already had this user, just update the queue position
                this.users[user.name].position = i;
                this.users[user.name].keep = true;
            } else {
                this.users[user.name] = {
                    position: i,
                    name: user.name,
                    color: user.color,
                    keep: true
                    // should have color here?
                };
            }
        }

        // Clean up removed Users
        for(let name in this.users) {
            const user = this.users[name];

            if(!user.keep) {
                console.log("Removed " + name + " from the game");
                Reflect.deleteProperty(this.users, name);
            } else {
                Reflect.deleteProperty(user, 'keep');
            }
        }

        this.list.innerHTML = "";
        
        for(let user of users) {

            const initial = user.name.charAt(0);
            const element = <li><span class={"user-bubble " + user.color}>{initial}</span></li>

            if (this.currentUser === user.name) {
                element.classList.add("current");
            }

            this.users[user.name].element = element;

            this.list.appendChild(element);
        }
    }

    displayMessageFromName(name, message) {
        const user = this.users[name];

        if(!user) return;

        const messageElement = <span class={"user-message " + user.color + "-text"}>{message}</span>;
        setTimeout(() => messageElement.classList.add('rise'), 1000);
        setTimeout(() => messageElement.parentNode.removeChild(messageElement), 3000);

        user.element.appendChild(messageElement);
    }

    render() {
        return this.list;
    }

}