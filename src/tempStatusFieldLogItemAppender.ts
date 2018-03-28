import { NotificationField } from '@jwmb/pixelmagic/lib/ui/notificationField';
import { Logger, MyLoggingEvent, Level, Appender } from '@jwmb/pixelmagic/lib/toReplace/logging';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';

export class StatusFieldLogItemAppender extends Appender {
    private static _statusField: SimpleText;
    append(loggingEvent: MyLoggingEvent) {
        Logger.fixMessages(loggingEvent);
        // if (!StatusFieldLogItemAppender._statusField) { //TODO: make a proper console out of this!
        //    var field = new SimpleText("", { font: "18px Verdana", fill: "white" }, false, RendererManager.instance.renderSettings.width);
        //    field.x = 0;
        //    field.y = RendererManager.instance.renderSettings.height - field.height;
        //    (<CognitionMattersApp>App.instance).overlayContainer.addChild(field);
        //    StatusFieldLogItemAppender._statusField = field;
        // } else { //make sure it's on top
        //    //App.instance.stage.removeChild(StatusFieldLogItemAppender._statusField);
        //    //App.instance.stage.addChild(StatusFieldLogItemAppender._statusField);
        // }
        if (loggingEvent.level >= Level.INFO) {
            NotificationField.i.log(loggingEvent.messages.join(','));
            // StatusFieldLogItemAppender._statusField.setText(loggingEvent.messages.join(","));
        }
    }
}
