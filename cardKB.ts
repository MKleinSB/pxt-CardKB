/**
This is a MakeCode extension for the Grove Keyboard CardKB" of M5Stack.
Further information can be found here: https://docs.m5stack.com/en/unit/cardkb
Based on https://github.com/jasperp92/CardKB-i2cKeyboard
 */

enum characterFormat {
    //% block=ASCII
    ascii,
    //% block=Charcode
    charcode
}

//% color="#AA278D" weight=200 icon="\uf11c" groups='["Basic","Events"]'
namespace CardKB {
    let i2cDevice = 95;

    export function readCharcode() {
        let charcode: number = 0;
        charcode = pins.i2cReadNumber(i2cDevice, NumberFormat.Int8LE, true)
        return charcode
    }

    function assignSpecialCharacter(negativeCharcode: number) {
        let specialCharacters: string[] = ['esc', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', 'del', 'tab', '{', '}', '[', ']', '/', '\\', '|', '~', "'", '"', '', '', 'shift', ';', ':', '`', '+', '-', '_', '=', '?', '', 'enter', 'sym', '', '', '', '', '', '', '', '', '<', '>', ' '];
        return specialCharacters[128 + negativeCharcode]
    }

    //% block "read Letter %format"
    //% block.loc.de="lies Buchstaben im Format %format"
    //% group="Basic"
    export function readLetter(format: characterFormat) {
        let message = 0;
        message = pins.i2cReadNumber(i2cDevice, NumberFormat.Int8LE, false)
        serial.writeLine("" + message)
        if (message != 0) {
            if (format == characterFormat.ascii) {
                return String.fromCharCode(message)
            } else if (characterFormat.charcode) {
                return message.toString()
            }
        }
        return ""
    }


    const keyEventID = 3100;
    let lastcharcode = 0;
    let aktcharcode = 0;

    //% block="charcode" group="Events"
    export function lastCharcode() {
        return aktcharcode
    }

    //% block="ASCII" group="Events"
    export function lastCharacter() {
        return String.fromCharCode(aktcharcode)
    }

    /**
    * Do something when a key on CardKB is pressed.
    */
    //% block="on cardKB pressed"
    //% block.loc.de ="wenn CardKB gedrückt"
    //% group="Events"
    export function cardKBpressed(handler: () => void) {
        control.onEvent(keyEventID, EventBusValue.MICROBIT_EVT_ANY, handler);
        aktcharcode = 0
        control.runInParallel(() => {
            while (true) {
                aktcharcode = readCharcode()
                if ((aktcharcode == -1 || aktcharcode == 0)) {
                    // kein Charcode, kein Event
                }
                else {
                    control.raiseEvent(keyEventID, EventBusValue.MICROBIT_EVT_ANY);
                    lastcharcode = aktcharcode;
                }
                basic.pause(200);
            }
        })
    }

}