const Generator = require(`yeoman-generator`);

const {isPlainObject} = require(`lodash`);

const {spawnSync: spawn} = require(`child_process`);

const mkdir = require(`mkdirp`);

const updateNotifier = require(`update-notifier`);
const pkg = require(`../package.json`);
const jsSHA = require(`jssha`);

let isFirstClear = false;

const shaObj = new jsSHA(`SHA-512`, `TEXT`);
shaObj.setHMACKey(`abc`, `TEXT`);
shaObj.update(`This is a `);
shaObj.update(`test`);
const hmac = shaObj.getHMAC(`B64`);

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }

    _clearConsole() {
        process.stdout.write(isFirstClear ? `\x1bc` : `\x1b[2J\x1b[0f`);
        isFirstClear = false;
    }

    _spawn(cmd) {
        const parts = cmd.split(` `);
        const [first, ...rest] = parts;

        spawn(first, rest, {
            stdio: `inherit`
        });
    }

    _copyFile(f) {
        let from = f;
        let to = f;

        if (isPlainObject(f)) ({from, to} = f);

        this.fs.copyTpl(this.templatePath(from), this.destinationPath(to), this.props, {
            interpolate: /<%=([\s\S]+?)%>/g
        });
    }

    _createDir(d) {
        mkdir(d, e => e && console.error(e));
    }

    initializing() {
        this.props = {
            appType: `frondEnd`,

            client: true,
            react: false,
            reactRouter: false,
            smoothscroll: false,
            port: 3000,

            nodemailer: false,
            APIPort: 3001,
            crypto: false,
            license: false,

            yarn: true,

            nodeVersion: process.version.split(`v`)[1],

            //TODO more powerfull secrets
            secret: hmac
        };
    }

    _parseName(name) {
        return name.split(` `).join(`-`);
    }

    prompting() {
        updateNotifier({pkg}).notify({defer: false});

        return this.prompt([
            {
                type: `input`,
                name: `name`,
                message: `Your project name`,
                default: this._parseName(this.appname) // Default to current folder name
            },
            {
                type: `list`,
                name: `appType`,
                message: `What kind of app would you like? (frontEnd)`,
                choices: [`frontEnd`, `API`]
            },
            {
                when: r => r.appType === `frontEnd`,
                type: `confirm`,
                name: `react`,
                default: false,
                message: `Do you need React? (No)`
            },
            {
                when: r => r.react,
                type: `confirm`,
                name: `reactRouter`,
                default: false,
                message: `with React-Router? (No)`
            },
            {
                when: r => r.appType === `frontEnd`,
                type: `confirm`,
                name: `smoothscroll`,
                default: false,
                message: `Do you need SmoothScroll? (No)`
            },
            {
                when: r => r.appType === `frontEnd`,
                type: `confirm`,
                name: `client`,
                default: true,
                message: `Do you need a client? (fetch) (Yes)`
            },
            {
                when: r => r.appType === `frontEnd`,
                type: `input`,
                name: `port`,
                default: 3000,
                message: `On what port would you like to run?`
            },
            {
                when: r => r.appType === `API`,
                type: `input`,
                name: `APIPort`,
                default: 3001,
                message: `On what port would you like to run the API?`
            },
            {
                when: r => r.appType === `API`,
                type: `confirm`,
                name: `license`,
                default: false,
                message: `Do you need a licence? (No)`
            },
            {
                when: r => r.appType === `API`,
                type: `confirm`,
                name: `nodemailer`,
                default: false,
                message: `Do you need nodemailer? (No)`
            },
            {
                when: r => r.appType === `API`,
                type: `confirm`,
                name: `crypto`,
                default: false,
                message: `Do you need crypto (No)?`
            }
        ]).then(props => {
            this.props = Object.assign(this.props, props);
        });
    }

    writing() {
        const css = [`src/css/reset.css`, `src/css/style.css`, `src/css/vars.css`, `src/css/modal.css`];

        const js = [`src/js/script.js`, `src/js/lib/helpers.js`];

        const html = [`src/index.html`];

        const client = [`src/js/lib/_templateClient.js`];

        const smoothscroll = [`src/js/lib/smoothscroll.js`];

        const react = [`src/js/containers/index.js`, `src/js/components/Error/index.css`, `src/js/components/Error/index.js`];

        const reactRouter = [
            `src/js/containers/index.js`,
            `src/js/routes/index.js`,
            `src/js/views/Error/index.css`,
            `src/js/views/Error/index.js`,
            `src/js/views/Home/index.css`,
            `src/js/views/Home/index.js`
        ];

        const ActionButtonComponent = [`src/js/components/ActionButton/index.js`, `src/js/components/ActionButton/index.css`];

        const ButtonComponent = [`src/js/components/Button/index.js`, `src/js/components/Button/index.css`];

        const ConfirmComponent = [`src/js/components/Confirm/index.js`, `src/js/components/Confirm/index.css`];

        const InputComponent = [`src/js/components/Input/index.js`, `src/js/components/Input/index.css`];

        const SelectComponent = [
            `src/js/components/Select/index.js`,
            `src/js/components/Select/index.css`,
            `src/assets/svg/angle-down.svg`
        ];

        const SwitchComponent = [`src/js/components/Switch/index.js`, `src/js/components/Switch/index.css`];

        const SearchComponent = [`src/js/components/Search/index.js`, `src/js/components/Search/index.css`];

        const FileInputComponent = [`src/js/components/FileInput/index.js`, `src/js/components/FileInput/index.css`];

        const ContextMenuComponent = [`src/js/components/ContextMenu/index.js`, `src/js/components/ContextMenu/index.css`];

        const ModalTitleComponent = [`src/js/components/ModalTitle/index.js`];

        const ModalHeaderComponent = [`src/js/components/ModalHeader/index.js`, `src/js/components/ModalHeader/index.css`];

        const TextareaComponent = [`src/js/components/Textarea/index.js`, `src/js/components/Textarea/index.css`];

        const UserComponent = [`src/js/components/User/index.js`, `src/js/components/User/index.css`];

        const DatePickerComponent = [
            `src/js/components/DatePicker/index.js`,
            `src/js/components/DatePicker/index.css`,
            `src/js/components/DatePicker/Day/index.js`,
            `src/js/components/DatePicker/FadedDay/index.js`,
            `src/js/components/DatePicker/Picker/index.js`
        ];

        const reactComponents = [
            ...ActionButtonComponent,
            ...ButtonComponent,
            ...ConfirmComponent,
            ...InputComponent,
            ...SelectComponent,
            ...SwitchComponent,
            ...ContextMenuComponent,
            ...ModalTitleComponent,
            ...TextareaComponent,
            ...DatePickerComponent,
            ...SearchComponent,
            ...FileInputComponent,
            ...ModalHeaderComponent,
            ...UserComponent
        ];

        const models = [{from: `server/app/models/user.js`, to: `app/models/user.js`}];

        const controllers = [{from: `server/app/routes/UserController.js`, to: `app/routes/UserController.js`}];

        const config = [{from: `server/config/db.js`, to: `config/db.js`}];

        const nodemailer = [
            {from: `server/lib/mailer/mailer.js`, to: `lib/mailer/mailer.js`},
            {from: `server/app/routes/ContactController.js`, to: `app/routes/ContactController.js`}
        ];

        const crypto = [
            {from: `server/lib/crypto/aes.js`, to: `lib/crypto/aes.js`},
            {from: `server/lib/crypto/hash.js`, to: `lib/crypto/hash.js`}
        ];

        const auth = [
            {from: `server/app/auth/models/mongodb.js`, to: `app/auth/models/mongodb.js`},
            {from: `server/app/auth/TapAuth.js`, to: `app/auth/TapAuth.js`},
            {from: `server/app/auth/TapAuth-v2.js`, to: `app/auth/TapAuth-v2.js`}
        ];

        const license = [
            {from: `server/app/models/license.js`, to: `app/models/license.js`},
            {from: `server/app/models/payment.js`, to: `app/models/payment.js`},
            {from: `server/app/models/pricing.js`, to: `app/models/pricing.js`},
            {from: `server/app/routes/LicenseController.js`, to: `app/routes/LicenseController.js`}
        ];

        let appFiles = [];

        if (this.props.appType === `frontEnd`) {
            appFiles = [...css, ...html, ...js];

            if (this.props.client) {
                appFiles = [...appFiles, ...client];
            }

            if (this.props.react && !this.props.reactRouter) {
                appFiles = [...appFiles, ...react, ...reactComponents];
            }

            if (this.props.reactRouter) {
                appFiles = [...appFiles, ...reactRouter, ...reactComponents];
            }

            if (this.props.smoothscroll) {
                appFiles = [...appFiles, ...smoothscroll];
            }
        }

        if (this.props.appType === `API`) {
            appFiles = [...auth, ...config, ...controllers, ...models];

            if (this.props.nodemailer) {
                appFiles = [...appFiles, ...nodemailer];
            }

            if (this.props.crypto) {
                appFiles = [...appFiles, ...crypto];
            }

            if (this.props.license) {
                appFiles = [...appFiles, ...license];
            }
        }

        appFiles.forEach(f => this._copyFile(f));

        let dirs = [];

        const FRDDirs = [`src/js/consts`];

        const src = [
            `src/assets/img`,
            `src/assets/fonts`,
            `src/assets/svg`,
            `src/assets/video`,
            `src/assets/audio`,
            `src/assets/data`
        ];

        if (this.props.appType === `frontEnd`) {
            dirs = [...FRDDirs, ...src];
        }

        dirs.forEach(d => this._createDir(d));

        let files = [];

        const git = [`README.md`, {from: `_gitignore`, to: `.gitignore`}];

        const gitAPI = [{from: `server/README.md`, to: `README.md`}, {from: `server/_gitignore`, to: `.gitignore`}];

        const indexAPI = [{from: `server/index.js`, to: `index.js`}];

        const envAPI = [{from: `server/.env`, to: `.env`}];

        const editorconfigAPI = [{from: `server/_editorconfig`, to: `.editorconfig`}];

        const eslintAPI = [{from: `server/_eslintrc`, to: `.eslintrc`}];

        const npmAPI = [{from: `server/_package.json`, to: `package.json`}];

        const eslint = [{from: `_eslintrc`, to: `.eslintrc`}];

        const stylelint = [`.stylelintrc`];

        const babel = [`.babelrc`];

        const editorconfig = [{from: `_editorconfig`, to: `.editorconfig`}];

        const webpack = [`webpack.config.babel.js`];

        const postcss = [`postcss.config.js`];

        const npm = [{from: `_package.json`, to: `package.json`}];

        if (this.props.appType === `frontEnd`) {
            files = [...git, ...npm, ...eslint, ...stylelint, ...babel, ...webpack, ...postcss, ...editorconfig];
        }

        if (this.props.appType === `API`) {
            files = [...gitAPI, ...indexAPI, ...envAPI, ...npmAPI, ...editorconfigAPI, ...eslintAPI];
        }

        files.forEach(f => this._copyFile(f));
    }

    install() {
        this._spawn(`git init`);

        if (this.props.yarn) this._spawn(`yarn`);
        else this._spawn(`npm install`);

        if (this.props.yarn) this._spawn(`yarn upgrade -L`);
        else this._spawn(`npm update`);

        this._spawn(`git add .`);
        spawn(`git`, [`commit`, `-m`, `:tada: initial commit`], {
            stdio: `inherit`
        });
    }
};
