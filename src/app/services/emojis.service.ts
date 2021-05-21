import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojisService {

  constructor() { }

  returnEmojis() {
    let arrayEmojis = [];

    const emojis = {
      "grinning": "😀",
      "grin": "😁",
      "joy": "😂",
      "smiley": "😃",
      "smile": "😄",
      "sweat_smile": "😅",
      "face-with-tears-of-joy": "😂",
      "laughing": "😆",
      "satisfied": "😆",
      "innocent": "😇",
      "smiling_imp": "😈",
      "wink": "😉",
      "blush": "😊",
      "yum": "😋",
      "relieved": "😌",
      "heart_eyes": "😍",
      "sunglasses": "😎",
      "smirk": "😏",
      "neutral_face": "😐",
      "expressionless": "😑",
      "unamused": "😒",
      "sweat": "😓",
      "pensive": "😔",
      "confused": "😕",
      "confounded": "😖",
      "kissing": "😗",
      "kissing_heart": "😘",
      "kissing_smiling_eyes": "😙",
      "kissing_closed_eyes": "😚",
      "stuck_out_tongue": "😛",
      "stuck_out_tongue_winking_eye": "😜",
      "stuck_out_tongue_closed_eyes": "😝",
      "disappointed": "😞",
      "worried": "😟",
      "angry": "😠",
      "rage": "😡",
      "cry": "😢",
      "persevere": "😣",
      "triumph": "😤",
      "disappointed_relieved": "😥",
      "frowning": "😦",
      "anguished": "😧",
      "fearful": "😨",
      "weary": "😩",
      "sleepy": "😪",
      "tired_face": "😫",
      "grimacing": "😬",
      "sob": "😭",
      "open_mouth": "😮",
      "hushed": "😯",
      "cold_sweat": "😰",
      "scream": "😱",
      "astonished": "😲",
      "flushed": "😳",
      "sleeping": "😴",
      "dizzy_face": "😵",
      "no_mouth": "😶",
      "mask": "😷",
      "slightly_frowning_face": "🙁",
      "slightly_smiling_face": "🙂",
      "upside_down_face": "🙃",
      "face_with_rolling_eyes": "🙄",
      "zipper_mouth_face": "🤐",
      "money_mouth_face": "🤑",
      "face_with_thermometer": "🤒",
      "nerd_face": "🤓",
      "thinking_face": "🤔",
      "face_with_head_bandage": "🤕",
      "hugging_face": "🤗",
      "rolling_on_the_floor_laughing": "🤣",
      "drooling_face": "🤤",
      "lying_face": "🤥",
      "sneezing_face": "🤧",
      "face_with_raised_eyebrow": "🤨",
      "face_with_one_eyebrow_raised": "🤨",
      "grinning_face_with_one_large_and_one_small_eye": "🤪",
      "shushing_face": "🤫",
      "face_with_finger_covering_closed_lips": "🤫",
      "face_with_hand_over_mouth": "🤭",
      "smiling_face_with_smiling_eyes_and_hand_covering_mouth": "🤭",
      "face_vomiting": "🤮",
      "face_with_open_mouth_vomiting": "🤮",
      "exploding_head": "🤯",
      "shocked_face_with_exploding_head": "🤯",  
    }

      Object.keys(emojis).forEach((item) => {
        arrayEmojis.push({
          name: item,
          value: emojis[item]
        });
      });

      return arrayEmojis;
  }
}
