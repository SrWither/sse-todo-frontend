import 'dart:developer' as developer;

dynamic parseEvent(String event) {
  int idx = event.indexOf(":");
  List parsed = [event.substring(0,idx).trim(), event.substring(idx+1).trim()];
  parsed.forEach((element) => {
    developer.log(element)
  });
}
