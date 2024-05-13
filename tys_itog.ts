class User implements IUser {
    public uid: number;
    public login: string;
    public password: string;
    public phone: string;
    public verification: boolean = false;
    public opendata: IUserPublicData;
    public privatedata: IUserPrivateData;
    public settings: IUserSettings;
    public role: 'admin' | 'user';
    finduserbyuid: any;
    addTransactionHistory: any;

    

    constructor() {}

verify(password: string, phone: string, age: number, cardnumber: number, geo: string) {
    if (!this.password) {
        this.password = password;
    }

    if (!this.phone) {
        this.phone = phone;
    }

    if (!this.opendata.age && age) {
        this.opendata.age = age;
    }

    if (!this.privatedata.cardnumber && cardnumber) {
        this.privatedata.cardnumber = cardnumber;
    }

    if (!this.privatedata.geo && geo) {
        this.privatedata.geo = geo;
    }

    this.verification = true;

    return { "status": 200, "text": "ok", "message": "verification success" };
}

forgetpwd(phone: string, password: string) {
    if (this.phone === phone && this.password === password) {
        return { "status": 200, "text": "ok", "message": "password reset success" };
    } else {
        return { "status": 401, "text": "unauthorized", "message": "phone number or password do not match" };
    }
}

transactiontrigger(uid: number, amount: number) {
    const receiver = this.finduserbyuid(uid);

    if (!receiver || receiver.balance < amount || this.privatedata.balance < amount) {
        return { "status": 400, "text": "bad request", "message": "not enough balance for transaction" };
    } else {
        // Add transaction to history
        this.addTransactionHistory(uid, amount);
        receiver.addTransactionHistory(this.uid, amount);

        // Update balances
        this.privatedata.balance -= amount;
        receiver.privatedata.balance += amount;

        return { "status": 200, "text": "ok", "message": "transaction successful" };
    }
}

transactionrecieve(uid: number, amount: number) {
    const sender = this.finduserbyuid(uid);

    // Add transaction to history
    this.addTransactionHistory(uid, amount);
    sender.addTransactionHistory(this.uid, amount);

    // Update balances
    this.privatedata.balance += amount;
    sender.privatedata.balance -= amount;

    return { "status": 200, "text": "ok", "message": "transaction received and processed" };
}

    signin(login: string, password: string) {
        if (this.login === login && this.password === password) {
            return {"status": 200, "text": "ok", "message": "login success"};
        } else if (this.login === login && this.password !== password) {
            return {"status": 401, "text": "unauthorized", "message": "bad login"};
        } else {
            return {"status": 401, "text": "unauthorized", "message": "bad password"};
        }
    }

    signup(login: string, password: string, repeatpassword: string) {
        if (this.login === "" || this.password === "" || repeatpassword === "") {
            return {"status": 400, "text": "bad request", "message": "empty fields"};
        }

        if (this.password !== repeatpassword) {
            return {"status": 400, "text": "bad request", "message": "passwords do not match"};
        }

        const existingUser = this.findUserByLogin(login);
        if (existingUser) {
            return {"status": 409, "text": "conflict", "message": "user with this login already exists"};
        }

        // проверка на соответствие регулярному выражению для логина
        const loginPattern = /^[a-zA-Z0-9_]+$/;
        if (!loginPattern.test(login)) {
            return {"status": 400, "text": "bad request", "message": "invalid login format"};
        }

        // проверка длины пароля
        if (password.length < 8) {
            return {"status": 400, "text": "bad request", "message": "password must be at least 8 characters long"};
        }

        // создание нового пользователя
        const newUid = this.generateUniqueId();
        this.uid = newUid;

        // авторизация нового пользователя
        this.signin(login, password);
    }

    findUserByLogin(login: string): boolean {
        // Реализация поиска пользователя по логину
        return true; // Пример результата
    }

    generateUniqueId(): number {
        // Генерация уникального идентификатора
        return 1; // Пример результата
    }
}



interface IUser {
    uid: number;
    login: string;
    password: string;
    phone: string;
    verification: boolean;
    opendata: IUserPublicData;
    privatedata: IUserPrivateData;
    settings: IUserSettings;
}

interface IUserPublicData {
    firstname: string;
    surname: string;
    nickname: string;
    age: number;
    image: string;
}

interface IUserPrivateData {
    cardnumber: number;
    geo: string;
    balance: number;
    transactionhistory: ITransaction[];
}

interface ITransaction {
    usertrigger: number;
    userreceiver: number;
    usertriggerpayment: boolean;
    userreceiverpayment: boolean;
    date: string;
    amount: number;
    status: "pending" | "success" | "error";
}

interface IUserSettings {
    mode: "dark" | "light";
    showimage: boolean;
    readytoreceive: boolean;
    readytoswap: boolean;
    transactionscount: number;
    lasttransaction: string;
    online: boolean;
}

interface ICoin {
    name: string;
    description: string;
    currencytousd: number;
    originurl: string;
}