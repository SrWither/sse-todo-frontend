import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MyTheme with ChangeNotifier {
  static bool _isDark = true;
  static bool _ism3 = true;

  void init() async {
    final prefs = await SharedPreferences.getInstance();
    _isDark = prefs.getBool('darkTheme')!;
  }

  ThemeMode currentTheme() {
    return _isDark ? ThemeMode.dark : ThemeMode.light;
  }

  void refreshTheme() {
    _isDark = _isDark;
    notifyListeners();
  }

  bool getTheme() {
    return _isDark ? true : false;
  }

  bool getMaterial() {
    return _ism3 ? true : false;
  }

  void switchTheme() {
    _isDark = !_isDark;
    notifyListeners();
  }

  void switchMaterial() {
    _ism3 = !_ism3;
    notifyListeners();
  }
}

class MyColors with ChangeNotifier {

  Color mainColor = Colors.blue;

  Color currentColor() {
    return mainColor;
  }

  void changeColor(Color color){
    mainColor = color;
    notifyListeners();
  }
}
