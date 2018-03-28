import { ErrorLogItem } from './toRemove/logItem';
import { StateLog } from './toRemove/stateLog';
import { MyLoggingEvent, Level, Logger, Appender } from '@jwmb/pixelmagic/lib/toReplace/logging';

export class LogItemAppender extends Appender {
    // consoleLogPrefix: string = null;
    static getErrorLogItem(e: MyLoggingEvent): ErrorLogItem {
        return new ErrorLogItem({ exception: e.exception, level: '' + e.level, timeStamp: e.timeStamp, messages: e.messages });
        // return ErrorLogItem.create(<ErrorLogItem>{ exception: e.exception, level: ""
        // + e.level, timeStamp: e.timeStamp, messages: e.messages });
    }
    append(loggingEvent: MyLoggingEvent) {
        Logger.fixMessages(loggingEvent);
        // var getFormattedMessage = () => {
        //    return new ErrorLogItem(<ErrorLogItem>{ exception: loggingEvent.exception,
        // level: "" + loggingEvent.level, timeStamp: loggingEvent.timeStamp, messages: loggingEvent.messages });
        // };
        // if (this.consoleLogPrefix != null) {
        //    console.log("LOGGER(" + this.consoleLogPrefix + ") " + loggingEvent.messages);
        // }
        // if (loggingEvent.level >= log4javascript.Level.WARN) {
        //    alert("" + this.consoleLogPrefix + ": " + loggingEvent.level + " " + loggingEvent.messages);
        // }
        if (StateLog.instance) {
            if (Logger.compareLevels(loggingEvent.level, Level.WARN) >= 0) {
            // if (loggingEvent.level >= log4javascript.Level.WARN) {
                StateLog.instance.log(LogItemAppender.getErrorLogItem(loggingEvent));
            }
        } else {
            // $.ajax({type: 'POST', url: '/logging', data: 'level=' + loggingEvent.level
            // + '&message=' + logMessageStr, async: true, success: (r) => store.clear() });
        }
    }
}
