import { readLocalStorage, saveLocalStorage, STORAGE_KEY } from "./storage";
import { Memo } from "./types";
import { marked } from "marked";

const memoList = document.getElementById("list") as HTMLDivElement;
const addButton = document.getElementById("add") as HTMLButtonElement;
const memoTitle = document.getElementById("memoTitle") as HTMLInputElement;
const memoBody = document.getElementById("memoBody") as HTMLTextAreaElement;
const editButton = document.getElementById("edit") as HTMLButtonElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const deleteButton = document.getElementById("delete") as HTMLButtonElement;
const previewBody = document.getElementById("previewBody") as HTMLDivElement;
const downloadLink = document.getElementById("download") as HTMLAnchorElement;
//****************
//処理
//************** */ */
let memos: Memo[] = [];
let memoIndex: number = 0;
downloadLink.addEventListener("click", clickDownloadMemo);
deleteButton.addEventListener("click", clickDeleteMemo);
addButton.addEventListener("click", clickAddMemo);
editButton.addEventListener("click", clickEditMemo);
saveButton.addEventListener("click", clickSaveMemo);

init();

//****************
//処理
//************** */ */
function newMemo(): Memo {
  const timestamp: number = Date.now();
  return {
    id: timestamp.toString() + memos.length.toString(),
    title: `new memo ${memos.length + 1}`,
    body: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
//初期化
function init() {
  //全てのメモをローカルストレージから取得する
  memos = readLocalStorage(STORAGE_KEY);
  console.log(memos);
  if (memos.length === 0) {
    //新しいメモを2つ作成する
    memos.push(newMemo());
    memos.push(newMemo());
    //全てのメモをローカルストレージに保存する
    saveLocalStorage(STORAGE_KEY, memos);
  }
  console.log(memos);

  showMemoElements(memoList, memos);
  //メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  //選択中のメモ情報を表示用のメモ要素に設定する
  setMemoElement();
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
}
//メモの要素を作成する
function newMemoElement(memo: Memo): HTMLDivElement {
  //div要素を作成する
  const div = document.createElement("div");
  //div要素にタイトルを設定する
  div.innerText = memo.title;
  //div要素のdata-id属性にめもIDを設定する
  div.setAttribute("data-id", memo.id);
  //div要素のclass属性にスタイルを設定する
  div.classList.add("w-full", "p-sm");
  div.addEventListener("click", selectedMemo);
  return div;
}
/**全てのメモ要素を削除する */
function clearMemoElements(div: HTMLDivElement) {
  div.innerText = "";
}
//全てのメモを表示する
function showMemoElements(div: HTMLDivElement, memos: Memo[]) {
  //メモ一覧をクリアする
  clearMemoElements(div);
  memos.forEach((memo) => {
    //メモのタイトルの要素を作成する
    const memoElement = newMemoElement(memo);
    //メモ一覧の末日にメモのタイトルの要素を追加する
    div.appendChild(memoElement);
  });
}
//div要素にアクティブスタイル設定をする
function setActiveStyle(index: number, isActive: boolean) {
  const selector = `#list > div:nth-child(${index})`;
  const element = document.querySelector(selector) as HTMLDivElement;
  if (isActive) {
    element.classList.add("active");
  } else {
    element.classList.remove("active");
  }
}

//メモを設定する
function setMemoElement() {
  const memo: Memo = memos[memoIndex];
  memoTitle.value = memo.title;
  memoBody.value = memo.body;
  //markdownで記述した本文(文字列)をHTMLにパースする
  (async () => {
    try {
      previewBody.innerHTML = await marked.parse(memo.body);
    } catch (error) {
      console.error(error);
    }
  })();
}

/**buttonようその　表示・非表示を設定 */
function setHiddenButton(button: HTMLButtonElement, isHidden: boolean) {
  if (isHidden) {
    button.removeAttribute("hidden");
  } else {
    button.setAttribute("hidden", "hidden");
  }
}

//**タイトルと本文の要素のdisabled属性を設定する */
function setEditMode(editMode: boolean) {
  if (editMode) {
    memoTitle.removeAttribute("disabled");
    memoBody.removeAttribute("disabled");
    //編集モード時は、textAreaを表示し、プレビュー用を非表示にする
    memoBody.removeAttribute("hidden");
    previewBody.setAttribute("hidden", "hidden");
  } else {
    memoTitle.setAttribute("disabled", "disabled");
    memoBody.setAttribute("disabled", "disabled");
    //表示モードの時はtextAreaを非表示にし、プレビュー用を表示する
    memoBody.setAttribute("hidden", "hidden");
    previewBody.removeAttribute("hidden");
  }
}

//イベント関連の関数一覧

function clickAddMemo(event: MouseEvent) {
  //タイトルと本文を編集モードにする
  setEditMode(true);
  //保存ボタンを表示し編集ボタンを非表示にする
  setHiddenButton(saveButton, true);
  setHiddenButton(editButton, false);
  //新しいメモを追加する
  memos.push(newMemo());
  //全てのメモをローカルストレージに保存する
  saveLocalStorage(STORAGE_KEY, memos);
  //新しいメモが追加されたインデックスを設定する
  memoIndex = memos.length - 1;
  //全てのメモのタイトルをメモ一覧に表示する
  showMemoElements(memoList, memos);
  //メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  //選択中のメモ情報を表示用のメモ要素に設定する
  setMemoElement();
}

/**メモが選択された時の処理 */
function selectedMemo(event: MouseEvent) {
  //タイトルと本文を表示モードにする
  setEditMode(false);
  //保存ボタンを非表示にし編集ボタンを表示する
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
  //メモ一覧の対ロつにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, false);
  //クリックされたdiv要素のdata-id属性からめもIDを取得する
  const target = event.target as HTMLDivElement;
  const id = target.getAttribute("data-id");
  //選択されたメモのインデックスを取得する
  memoIndex = memos.findIndex((memo) => memo.id === id);
  //選択中のメモ情報を表示用のメモ要素に設定する
  setMemoElement();
  //メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
}

function clickEditMemo(event: MouseEvent) {
  setEditMode(true);
  setHiddenButton(saveButton, true);
  setHiddenButton(editButton, false);
}
function clickSaveMemo(event: MouseEvent) {
  const memo: Memo = memos[memoIndex];
  memo.title = memoTitle.value;
  memo.body = memoBody.value;
  memo.updatedAt = Date.now();
  saveLocalStorage(STORAGE_KEY, memos);
  setEditMode(false);
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
  showMemoElements(memoList, memos);
  setActiveStyle(memoIndex + 1, true);
}

//削除ボタンが押された時の処理
function clickDeleteMemo(event: MouseEvent) {
  if (memos.length === 1) {
    alert("これ以上は削除できません");
    return;
  }
  const memoId = memos[memoIndex].id;
  memos = memos.filter((memo) => memo.id !== memoId);
  saveLocalStorage(STORAGE_KEY, memos);
  if (1 <= memoIndex) {
    memoIndex--;
  }
  setMemoElement();
  //画面右側を表示モードにする
  setEditMode(false);
  //保存ボタンを非表示にし編集ボタンを表示する
  setHiddenButton(saveButton, false);
  setHiddenButton(editButton, true);
  //画面右側のメモのタイトル一覧を再描画する
  showMemoElements(memoList, memos);
  //表示するメモのタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  setMemoElement();
}
//ダウンロードのリンクがクリックされた時の処理
function clickDownloadMemo(event: MouseEvent) {
  //ダウンロードするメモを取得する
  const memo = memos[memoIndex];
  //イベントが発生した要素を取得する
  const target = event.target as HTMLAnchorElement;
  //ダウンロードするだいるの名前を指定する
  target.download = `${memo.title}.md`;
  //ダウンロードするファイルのデータを設定する
  target.href = URL.createObjectURL(
    new Blob([memo.body], {
      type: "application/octer-stream",
    })
  );
}
