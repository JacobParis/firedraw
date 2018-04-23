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
            const name = users[i];
            if(Reflect.has(this.users, name)) {
                // We already had this user, just update the queue position
                this.users[name].position = i;
                this.users[name].keep = true;
            } else {
                this.users[name] = {
                    position: i,
                    name: name,
                    color: "cyan",//user.color,
                    keep: true
                };
            }
        }

        // Clean up removed Users
        for(const name in this.users) {
            const user = this.users[name];

            if(!user.keep) {
                console.log("Removed " + name + " from the game");
                Reflect.deleteProperty(this.users, name);
            } else {
                Reflect.deleteProperty(user, 'keep');
            }
        }

        this.list.innerHTML = "";
        
        for(const name of users) {
            const initial = name.charAt(0);
            const element = <li><span class={"user-bubble "}>{initial}</span></li>

            if (this.currentUser === name) {
                element.classList.add("current");
            }

            this.users[name].element = element;

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