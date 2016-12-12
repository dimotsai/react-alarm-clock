/* a function which performs zerofill on a numeric */
var paddy = function (n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
};

var isValidUrl = function (url) {
    var regex = /^(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?$/i;
    return !!url.match(regex);
};

var getExt = function (filename) {
    var regex = /(?:\.([^.]+))?$/i;
    return regex.exec(filename)[1];
};

var ext2mime = function (ext) {
    var mime = {
        mp3: 'audio/mpeg',
        flac: 'audio/flac',
        ogg: 'audio/ogg',
        oga: 'audio/ogg',
        wav: 'audio/wav',
        weba: 'audio/webm'
    };

    return mime[ext];
};

/* the default alarm list */
var data = [];

/* the default sounds for selection */
var bells = [{ name: 'piano-melody', type: 'audio/wav', path: 'bell/70214__qlc__65bpm-piano-melody-0589.wav' }, { name: 'fractal-ramp-sonnet', type: 'audio/mpeg', path: 'bell/70002__qlc__240bpm-fractal-ramp-sonnet-track-1.mp3' }, { name: 'osng', type: 'audio/wav', path: 'bell/70213__qlc__152bpm-osng.wav' }, { name: 'zichus', type: 'audio/wav', path: 'bell/70217__qlc__85bpm-zichus.wav' }];

/* A clock component displaying the current time */
var Clock = React.createClass({
    displayName: 'Clock',

    getInitialState: function () {
        return { time: new Date(), id: 0 };
    },
    componentDidMount: function () {
        var state = this.state;
        state.id = setInterval(function () {
            var state = this.state;
            state.time = new Date();
            this.setState(state);
        }.bind(this), 1000);
        this.setState(state);
    },
    componentWillUnmount: function () {
        clearInterval(this.state.id);
    },
    render: function () {
        return React.createElement(
            'h1',
            { className: 'text-center wall-clock' },
            $.format.date(this.state.time, 'HH:mm:ss')
        );
    }
});

/* A component for selecting and playing a sound */
var Bell = React.createClass({
    displayName: 'Bell',

    ring: function () {
        this.refs.audio.getDOMNode().load();
        this.refs.audio.getDOMNode().play();
    },
    getInitialState: function () {
        return {
            bell: this.props.bells[0],
            inputURL: '',
            errorFile: false,
            errorURL: false
        };
    },
    getDefaultProps: function () {
        return {
            bells: [],
            onAddAudio: function (file) {
                console.log(file);
            }
        };
    },
    handleChange: function (event) {
        var key = event.target.value;
        this.setState({
            bell: this.props.bells[key]
        });
    },
    handlePlay: function () {
        this.refs.audio.getDOMNode().load();
        this.refs.audio.getDOMNode().play();
    },
    handleInputURL: function (event) {
        this.setState({ inputURL: event.target.value });
    },
    handleStop: function () {
        this.refs.audio.getDOMNode().pause();
    },
    handleAddLocalSound: function (event) {
        var supportAudioType = ['audio/ogg', 'audio/webm', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/mp3', 'audio/mp4', 'audio/flac', 'audio/x-flac'];
        var file = event.target.files[0];
        var ext = getExt(file.name);
        var type = file.type ? file.type : ext2mime(ext);

        if (supportAudioType.indexOf(type) !== -1) {
            this.props.onAddAudio({ name: file.name, type: type, path: URL.createObjectURL(file) });
            this.setState({ errorFile: false, errorURL: false });
        } else {
            console.error('Unsupported audio type: ' + file.type);
            this.setState({ errorFile: true });
        }
    },
    handleAddAudioURL: function (event) {
        var url = this.state.inputURL;
        var ext = getExt(url);
        var type = ext2mime(ext);
        if (isValidUrl(url) && type) {
            this.props.onAddAudio({ name: url.split('/').pop(), path: url, type: type });
            this.setState({ errorFile: false, errorURL: false, inputURL: '' });
        } else {
            this.setState({ errorURL: true });
        }
    },
    render: function () {
        var options = this.props.bells.map(function (bell, i) {
            return React.createElement(
                'option',
                { value: i, key: i },
                bell.name
            );
        });
        var errorAlert = React.createElement(
            'div',
            { className: 'alert alert-danger' },
            'Unsupported audio type'
        );
        return React.createElement(
            'div',
            { className: 'bell' },
            React.createElement(
                'audio',
                { ref: 'audio', loop: true },
                React.createElement('source', { src: this.state.bell.path }),
                'Your browser does not support the audio element.'
            ),
            React.createElement(
                'div',
                { className: 'form' },
                React.createElement(
                    'div',
                    { className: 'form-group form-inline' },
                    React.createElement(
                        'select',
                        { className: 'form-control', onChange: this.handleChange },
                        options
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-primary', onClick: this.handlePlay },
                        React.createElement('span', { className: 'glyphicon glyphicon-play' })
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-default', onClick: this.handleStop },
                        React.createElement('span', { className: 'glyphicon glyphicon-stop' })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        null,
                        'Local audio file'
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'local-sound', className: 'btn btn-default' },
                            'Browse...'
                        ),
                        React.createElement('input', { id: 'local-sound', className: 'hidden', type: 'file', onChange: this.handleAddLocalSound })
                    ),
                    this.state.errorFile ? errorAlert : undefined
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        null,
                        'Audio URL'
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-group form-inline' },
                        React.createElement('input', { className: 'form-control', onChange: this.handleInputURL, value: this.state.inputURL }),
                        React.createElement(
                            'button',
                            { className: 'btn btn-default', onClick: this.handleAddAudioURL },
                            'Add'
                        )
                    ),
                    this.state.errorURL ? errorAlert : undefined
                )
            )
        );
    }
});

/* A single alarm record */
var AlarmEntry = React.createClass({
    displayName: 'AlarmEntry',

    enable: function () {
        var currentTime = new Date();
        var interval = this.props.time.getHours() * 3600 + this.props.time.getMinutes() * 60 + this.props.time.getSeconds();
        interval -= currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
        interval *= 1000;

        if (interval < 0) interval += 86000 * 1000;

        var id = setTimeout(function () {
            this.setState($.extend(this.state, { enable: false }));
            this.props.onRing();
            this.disable();
        }.bind(this), interval);

        var state = this.state;
        state.intervalId = id;
        this.setState(state);
    },
    disable: function () {
        var state = this.state;
        clearTimeout(state.intervalId);
        state.intervalId = 0;
        this.setState(state);
    },
    handleCheck: function (event) {
        var state = this.state;
        state.enable = event.target.checked;
        this.setState(state);

        this.handleSwitch();
    },
    handleSwitch: function () {
        if (this.state.enable && this.state.intervalId == 0) this.enable();else if (!this.state.enable && this.state.intervalId != 0) this.disable();
    },
    getInitialState: function () {
        return { time: this.props.time, comment: this.props.comment, enable: true, intervalId: 0 };
    },
    getDefaultProps: function () {
        return {
            onRing: function () {},
            onClose: function () {},
            enable: true,
            comment: '',
            time: new Date()
        };
    },
    componentDidMount: function () {
        this.handleSwitch();
    },
    componentWillUnmount: function () {
        clearTimeout(this.state.intervalId);
    },
    render: function () {
        return React.createElement(
            'li',
            { className: 'list-group-item' },
            React.createElement('input', { type: 'checkbox', onChange: this.handleCheck, ref: 'checkbox', checked: this.state.enable }),
            React.createElement(
                'span',
                null,
                $.format.date(this.state.time, 'HH:mm:ss')
            ),
            '\xA0',
            React.createElement(
                'span',
                { className: 'label label-default' },
                this.state.comment
            ),
            React.createElement(
                'button',
                { type: 'button', className: 'close', 'aria-label': 'Close', onClick: this.props.onClose },
                React.createElement(
                    'span',
                    { 'aria-hidden': 'true' },
                    '\xD7'
                )
            )
        );
    }
});

/* Alarm list */
var AlarmList = React.createClass({
    displayName: 'AlarmList',

    getInitialState: function () {
        return { data: this.props.data };
    },
    handleEntryClose: function (index) {
        var state = this.state;
        state.data.splice(index, 1);
        this.setState(state);
    },
    handleAddEntry: function (entry) {
        var state = this.state;
        state.data.push(entry);
        this.setState(state);
    },
    render: function () {
        var alarmNodes = this.state.data.map(function (alarm, i) {
            if (alarm === undefined) return undefined;
            return React.createElement(AlarmEntry, { time: alarm.time, comment: alarm.comment, onClose: this.handleEntryClose.bind(this, i), key: i, onRing: this.props.onRing });
        }.bind(this));

        var list = function () {
            if (this.state.data.length == 0) {
                return React.createElement(
                    'li',
                    { className: 'list-group-item' },
                    'None'
                );
            } else {
                return alarmNodes;
            }
        }.bind(this);

        return React.createElement(
            'ul',
            { className: 'alarmList list-group' },
            list()
        );
    }
});

/* A component for selecting a number */
var AlarmDigit = React.createClass({
    displayName: 'AlarmDigit',

    getInterval: function (counter) {
        if (counter > 5) return 75;else if (counter > 20) return 50;else if (counter > 30) return 5;else return 150;
    },
    getInitialState: function () {
        var val = typeof this.props.val !== 'undefined' ? this.props.val : 0;
        return { value: val, increasing: 0, decreasing: 0, increaseCounter: 0, decreaseCounter: 0 };
    },
    handleCarry: function () {
        this.handleIncrease(true);
    },
    handleBorrow: function () {
        this.handleDecrease(true);
    },
    handleIncrease: function (once) {
        var state = this.state;
        state.value++;
        state.increaseCounter++;
        if (state.value >= this.props.numberSystem) {
            if (typeof this.props.onCarry === 'function') this.props.onCarry();
            state.value = 0;
        }

        if (once !== true) state.increasing = setTimeout(this.handleIncrease, this.getInterval(this.state.increaseCounter));
        this.setState(state);
    },
    handleStartIncrease: function () {
        var state = this.state;
        state.increaseCounter = 0;
        this.setState(state);
        this.handleIncrease();
    },
    handleStopIncrease: function () {
        var state = this.state;
        clearTimeout(state.increasing);
        this.setState(state);
    },
    handleDecrease: function (once) {
        var state = this.state;
        state.value--;
        state.decreaseCounter++;
        if (state.value < 0) {
            if (typeof this.props.onBorrow === 'function') this.props.onBorrow();
            state.value = this.props.numberSystem - 1;
        }
        if (once !== true) state.decreasing = setTimeout(this.handleDecrease, this.getInterval(this.state.decreaseCounter));
        this.setState(state);
    },
    handleStartDecrease: function () {
        var state = this.state;
        state.decreasing = true;
        state.decreaseCounter = 0;
        this.setState(state);
        this.handleDecrease();
    },
    handleStopDecrease: function () {
        var state = this.state;
        clearTimeout(state.decreasing);
        this.setState(state);
    },
    handleChange: function (event) {
        var value = event.target.value.slice(-2);
        if (value >= this.props.numberSystem) value = event.target.value.slice(-1);
        console.log(value);
        this.setState($.extend(this.state, { value: value }));
    },
    handleKeyDown: function (event) {
        if (event.keyCode == 38) {
            this.handleIncrease(true);
        }

        if (event.keyCode == 40) {
            this.handleDecrease(true);
        }
    },
    handleWheel: function (event) {
        event.preventDefault();
        if (event.deltaY > 0) {
            this.handleDecrease(true);
        }
        if (event.deltaY < 0) {
            this.handleIncrease(true);
        }
    },
    render: function () {
        var value = paddy(this.state.value, 2);
        return React.createElement(
            'div',
            { className: 'alarmDigit alarm-digit' },
            React.createElement(
                'button',
                { className: 'increase btn btn-default', onMouseDown: this.handleStartIncrease, onMouseUp: this.handleStopIncrease },
                React.createElement('span', { className: 'glyphicon glyphicon-menu-up', 'aria-hidden': 'true' })
            ),
            React.createElement('input', { className: 'form-control text-center', type: 'text', value: value, onChange: this.handleChange, onKeyDown: this.handleKeyDown, onWheel: this.handleWheel }),
            React.createElement(
                'button',
                { className: 'decrease btn btn-default', onMouseDown: this.handleStartDecrease, onMouseUp: this.handleStopDecrease },
                React.createElement('span', { className: 'glyphicon glyphicon-menu-down', 'aria-hidden': 'true' })
            )
        );
    }
});

/* main component */
var Alarm = React.createClass({
    displayName: 'Alarm',

    getInitialState: function () {
        return { bells: bells };
    },
    handleCarry: function (digit) {
        this.refs[digit].handleCarry();
    },
    handleBorrow: function (digit) {
        this.refs[digit].handleBorrow();
    },
    handleRing: function () {
        this.refs.bell.ring();
    },
    handleAddAlarm: function () {
        var date = new Date();
        date.setHours(this.refs.hourDigit.state.value);
        date.setMinutes(this.refs.minuteDigit.state.value);
        date.setSeconds(this.refs.secondDigit.state.value);
        this.refs.alarmList.handleAddEntry({ time: date, comment: this.refs.comment.getDOMNode().value });
    },
    handleAddAudio: function (audio) {
        this.setState({
            bells: this.state.bells.concat(audio)
        });
    },
    render: function () {
        var date = new Date();
        return React.createElement(
            'div',
            { className: 'alarm' },
            React.createElement(Clock, null),
            React.createElement(
                'div',
                { className: 'alarm-container' },
                React.createElement(
                    'div',
                    { className: 'alarm-digits' },
                    React.createElement(AlarmDigit, { numberSystem: 24, val: date.getHours(), ref: 'hourDigit' }),
                    React.createElement(AlarmDigit, { numberSystem: 60, val: date.getMinutes(), onCarry: this.handleCarry.bind(this, 'hourDigit'), onBorrow: this.handleBorrow.bind(this, 'hourDigit'), ref: 'minuteDigit' }),
                    React.createElement(AlarmDigit, { numberSystem: 60, val: date.getSeconds(), onCarry: this.handleCarry.bind(this, 'minuteDigit'), onBorrow: this.handleBorrow.bind(this, 'minuteDigit'), ref: 'secondDigit' })
                ),
                React.createElement(
                    'div',
                    { className: 'form-inline text-center comment' },
                    React.createElement('input', { className: 'form-control', type: 'text', ref: 'comment', placeholder: 'Leave your comment...', ref: 'comment' }),
                    React.createElement(
                        'button',
                        { className: 'btn btn-default', type: 'button', onClick: this.handleAddAlarm },
                        React.createElement('span', { className: 'glyphicon glyphicon-plus', 'aria-hidden': 'true' })
                    )
                ),
                React.createElement(
                    'h2',
                    null,
                    'Sounds'
                ),
                React.createElement(Bell, { ref: 'bell', bells: this.state.bells, onAddAudio: this.handleAddAudio }),
                React.createElement(
                    'h2',
                    null,
                    'Alarms'
                ),
                React.createElement(AlarmList, { data: data, ref: 'alarmList', onRing: this.handleRing })
            )
        );
    }
});

React.render(React.createElement(Alarm, null), document.getElementById('content'));
