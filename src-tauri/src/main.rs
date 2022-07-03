#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use regex::RegexBuilder;
// fn main() {
//   let context = tauri::generate_context!();
//   tauri::Builder::default()
//     .menu(if cfg!(target_os = "macos") {
//       tauri::Menu::os_default(&context.package_info().name)
//     } else {
//       tauri::Menu::default()
//     })
//     .run(context)
//     .expect("error while running tauri application");
// }

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![search_items])
    .run(tauri::generate_context!())
    .expect("failed to run app");
}

#[tauri::command]
fn search_items<'a>(re: String, items: Vec<String>) -> Vec<String> {
  let re = RegexBuilder::new(&re).case_insensitive(true).build().unwrap();
  items.iter().filter(|item| -> bool {
    return *&re.is_match(item.to_owned())
  }).map(|item| item.to_owned()).collect::<Vec<String>>()
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test] 
  fn test_re_make() {
    let new_items = search_items("One".to_string(), vec!["One".to_string(), "two".to_string(), "three".to_string()]);
    assert_eq!(*new_items.get(0).unwrap(), "One".to_string());
    assert_eq!(*new_items.get(1).unwrap_or(&"N/A".to_string()), "N/A".to_string());
  }

  #[test]
  fn test_multiple_results() {
    let input_vec = vec!["OneT".to_string(), "two".to_string(), "three".to_string()];
    let input_vec_copy = input_vec.clone();
    let new_items = search_items("t".to_string(), input_vec);
    let _items_test = new_items.iter().enumerate().map(|(idx, item)|{
      assert_eq!(item, input_vec_copy.get(idx).unwrap());
    });
  }
}
