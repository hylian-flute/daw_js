"use strict";

// ループが規定時間以内に終わらなかったときにプログラムを強制終了する処理
const timeCheck = (() => {
  let s = Date.now();
  return {
    reset: () => s = Date.now(),
    check: () => {
      if (Date.now() - s >= 5000) throw "Time Over";
      return 0;
    },
  }
})();

// 音符クラス: {音程, 開始フレーム, 持続フレーム}
class Note {
  constructor(tone, start, time, oneBarFrame) {
    this.tone = tone;
    this.start = Math.round(oneBarFrame * start);
    this.time = Math.round(oneBarFrame * time);
  }
}

// 音符インスタンスの配列からなる楽譜を得る
const getScore = sampleRate => {
  const tempo = 185;

  // 1小節のフレーム数
  const oneBarFrame = 240*sampleRate/tempo;

  return [
    // メロディ
    [
      ["C5", 0 + 1/4, 1/8],
      ["C5", 0 + 3/8, 1/8],
      ["C5", 0 + 2/4, 1/4],
      ["C5", 0 + 3/4, 1/8],
      ["C5", 0 + 7/8, 3/8],
      ["C5", 1 + 1/4, 1/4],
      ["B4", 1 + 2/4, 1/4],
      ["A4", 1 + 3/4, 1/4],
      ["G4", 2, 1/4],
      ["D4", 2 + 1/4, 1/8],
      ["D4", 2 + 3/8, 3/8],
      ["F4", 2 + 3/4, 1/8],
      ["E4", 2 + 7/8, 9/8],
      ["C5", 4 + 1/4, 1/8],
      ["C5", 4 + 3/8, 1/8],
      ["C5", 4 + 2/4, 1/4],
      ["C5", 4 + 3/4, 1/8],
      ["C5", 4 + 7/8, 3/8],
      ["C5", 5 + 1/4, 1/4],
      ["B4", 5 + 2/4, 1/4],
      ["A4", 5 + 3/4, 1/4],
      ["G4", 6, 1/8],
      ["G4", 6 + 1/4, 1/8],
      ["C5", 6 + 3/8, 3/8],
      ["D5", 6 + 3/4, 1/4],
      ["E5", 7, 1/2],
      ["D5", 7 + 2/4, 1/8],
      ["C5", 7 + 5/8, 3/8],
    ],

    // 伴奏
    [
      ["A3", 0, 1],
      ["C3", 0, 1],
      ["E3", 0, 1],
      ["F3", 1, 1],
      ["A3", 1, 1],
      ["C3", 1, 1],
      ["G3", 2, 1],
      ["B3", 2, 1],
      ["D3", 2, 1],
      ["C3", 3, 1],
      ["E3", 3, 1],
      ["G3", 3, 1],
      ["A3", 4, 1],
      ["C3", 4, 1],
      ["E3", 4, 1],
      ["F3", 5, 1],
      ["A3", 5, 1],
      ["C3", 5, 1],
      ["G3", 6, 1],
      ["B3", 6, 1],
      ["D3", 6, 1],
      ["C4", 7, 1],
      ["E3", 7, 1],
      ["G3", 7, 1],
    ],

    // スネア
    [
      ["C4", 0 + 1/4, 1/8],
      ["C4", 0 + 3/4, 1/8],
      ["C4", 1 + 1/4, 1/8],
      ["C4", 1 + 3/4, 1/8],
      ["C4", 2 + 1/4, 1/8],
      ["C4", 2 + 3/4, 1/8],
      ["C4", 3 + 1/4, 1/8],
      ["C4", 3 + 3/4, 1/8],
      ["C4", 4 + 1/4, 1/8],
      ["C4", 4 + 3/4, 1/8],
      ["C4", 5 + 1/4, 1/8],
      ["C4", 5 + 3/4, 1/8],
      ["C4", 6 + 1/4, 1/8],
      ["C4", 6 + 3/4, 1/8],
      ["C4", 7 + 1/4, 1/8],
      ["C4", 7 + 3/4, 1/8],
    ],

    // バスドラム
    [
      ["A1", 0 + 0/4, 1/8],
      ["A1", 0 + 2/4, 1/8],
      ["A1", 0 + 5/8, 1/8],
      ["A1", 1 + 1/8, 1/8],
      ["A1", 1 + 2/4, 1/8],
      ["A1", 1 + 5/8, 1/8],
      ["A1", 2 + 0/4, 1/8],
      ["A1", 2 + 2/4, 1/8],
      ["A1", 2 + 5/8, 1/8],
      ["A1", 3 + 1/8, 1/8],
      ["A1", 3 + 2/4, 1/8],
      ["A1", 3 + 5/8, 1/8],
      ["A1", 4 + 0/4, 1/8],
      ["A1", 4 + 2/4, 1/8],
      ["A1", 4 + 5/8, 1/8],
      ["A1", 5 + 1/8, 1/8],
      ["A1", 5 + 2/4, 1/8],
      ["A1", 5 + 5/8, 1/8],
      ["A1", 6 + 0/4, 1/8],
      ["A1", 6 + 2/4, 1/8],
      ["A1", 6 + 5/8, 1/8],
      ["A1", 7 + 1/8, 1/8],
      ["A1", 7 + 2/4, 1/8],
      ["A1", 7 + 5/8, 1/8],
    ],
  ].map(noteArr => noteArr.map(n => new Note(...n, oneBarFrame)));
};

// 波形を得る, rad: 波長=2*PIの時刻, t: 時刻(秒)
const getWaveformArr = () => {
  return [
    // スーパーソー
    (rad, t) => {
      const p = rad % (2 * Math.PI);
      const p2 = (rad * 1.005) % (2 * Math.PI)
      return (
        1 / Math.PI * p - 1
        + 1 / Math.PI * p2 - 1
      )/2;
    },

    // 三角波
    (rad, t) => {
      const p = rad %= 2 * Math.PI;
      return (
        p < Math.PI
        ? 2 / Math.PI * p - 1
        : -2 / Math.PI * p + 3
      );
    },

    // 減衰するホワイトノイズ
    (rad, t) => (Math.random() * 2 - 1) * (1 / (64 * t + 1)),

    // 減衰するサイン波
    (rad, t) => (Math.sin(rad) + (Math.random() * 2 - 1)/4)
      * (1 / (32  * t + 1)),
  ];
};

// ソースに渡すバッファを生成する
const generateBuffer = audioCtx => {
  timeCheck.reset();
  const score= getScore(audioCtx.sampleRate);

  // 各階名がAと半音いくつ分の差があるか
  const toneNameMap = new Map([
    ["C", -9],
    ["C#", -8], ["Db", -8],
    ["D", -7],
    ["D#", -6], ["Eb", -6],
    ["E", -5],
    ["F", -4],
    ["F#", -3], ["Gb", -3],
    ["G", -2],
    ["G#", -1], ["Ab", -1],
    ["A", 0],
    ["A#", 1], ["Bb", 1],
    ["B", 2],
  ]);

  // 音程の文字列に対応する周波数を予め計算する
  const freqMap = new Map();
  score.flat().forEach(note => {
    if (freqMap.has(note.tone)) return 0;
    const freq = (() => {
      const keyNum = toneNameMap.get(note.tone.match(/^[A-G][#b]?/)[0]);
      const octave = parseInt(note.tone.match(/-?\d+$/)[0], 10) - 4;
      return 440 * 2 ** ((keyNum + 12 * octave) / 12);
    })();
    freqMap.set(note.tone, freq);
  });

  // 各トラックと音程に対応する波形を保存するマップ
  const waveformArr = getWaveformArr();
  const waveMap = new Map();
  score.forEach((noteArr, track) => {
    noteArr.forEach(note => {
      const key = `${track}-${note.tone}`;
      const wave = (waveMap.has(key) ? waveMap.get(key) : []);
      if (wave.length >= note.time) return 0;

      for (let t = wave.length; t < note.time; ++t) {
        wave.push(waveformArr[track](
          2 * Math.PI * t * freqMap.get(note.tone) / audioCtx.sampleRate,
          t/audioCtx.sampleRate,
        ));
      }
      waveMap.set(key, wave);
    });
  });

  const channelNum= 2;
  const buffer = audioCtx.createBuffer(
    channelNum,
    score.flat().reduce(
      (acc, note) => Math.max(acc, note.start + note.time),
      0
    ),
    audioCtx.sampleRate
  ); 

  for (let ch = 0; ch < channelNum; ++ch) {
    const channelData = buffer.getChannelData(ch);
    score.forEach((noteArr, track) => {
      noteArr.forEach(note => {
        const wave = waveMap.get(`${track}-${note.tone}`);
        for (let t = 0; t < note.time; ++t) {
          channelData[note.start + t] += wave[t];
        }
        timeCheck.check();
      });
    });
  }

  let maxGain = 0;
  for (let ch = 0; ch < channelNum; ++ch) {
    maxGain = Math.max(maxGain, buffer.getChannelData(ch).reduce(
      (acc, cur) => Math.max(acc, Math.abs(cur)),
      0
    ));
  }
  if (maxGain > 0) {
    for (let ch = 0; ch < channelNum; ++ch) {
      const channelData = buffer.getChannelData(ch);
      for (let i = 0; i < channelData.length; ++i) {
        channelData[i] /= maxGain;
      }
    }
  }

  return buffer;
};

// スタートボタンを押されたときの処理
const start = () => {
  const startTime = Date.now();
  if (!window.AudioContext) {
    window.alert("非対応ブラウザ");
    return 0;
  }
  const audioCtx = new window.AudioContext();
  const source = audioCtx.createBufferSource();
  source.buffer = generateBuffer(audioCtx);
  source.connect(audioCtx.destination);

  // 停止ボタンの処理を設定
  document.querySelector("#stop-button").onclick = () => source.stop();

  source.start();
  console.log(`Total time: ${Date.now() - startTime}ms`);
};

window.onload = () => {
  document.querySelector("#start-button").onclick = start;
};
