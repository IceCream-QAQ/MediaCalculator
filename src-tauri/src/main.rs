#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use lofty::{read_from_path};

#[tauri::command]
fn print(message: String) {
    println!("WebView Message: {}", message);
}

#[tauri::command]
fn music_time(path: String) -> i32 {
    println!("OnMusicPath: {}", path);

    let tagged_file = read_from_path(path, true).unwrap();

    (tagged_file.properties().duration().as_millis() as i32).into()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![print,music_time])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


