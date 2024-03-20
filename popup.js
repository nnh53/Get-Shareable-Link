// ====================== HÀM ĐỂ HIỂN THỊ LÊN EXTENSION ======================
function displayLink(id, tabId) {
  if (id == undefined || id == undefined) {
    document.querySelector(".input-group").style.display = "none";
    document.querySelector(".container").innerHTML += `
    <div class="alert alert-warning" role="alert" style="background-color: #e6f7ff;">
      Sorry, There is no link available current browser tab.
      Please make sure you are in the <strong>"My submission"</strong> tab  
    </div>
    `;
  } else {
    submissionID = id;
    // chrome.scripting.executeScript(tabId, { code: 'console.log("' + submissionID + '");' });
    // chrome.scripting.executeScript({
    //   target: { tabId: tabId },
    //   function: () => {
    //     return console.log(submissionID);
    //   },
    // });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
      //Be aware that `tab` is an array of Tabs
      let fromIndex = 0;
      let countSlash = 0;
      //https://www.course.org/learn/detect-mitigate-ethical-risks/peer/oqeJE/algorithmic-impact-assessment-aia/submit
      //      ^^                ^     ^                             ^    ^     ^                                 ^
      //Total 8 slash before the end of "real" link
      //So we will scan until slash number 8 and then stop
      while (tab[0].url.indexOf("/", fromIndex) != -1) {
        fromIndex = tab[0].url.indexOf("/", fromIndex + 1);
        countSlash++;
        if (countSlash >= 8) break;
      }
      document.querySelector("#shareLink").value = tab[0].url.substring(0, fromIndex) + "/review/" + submissionID;
    });
  }
}

// ====================== FUNCTIONS ======================
/**
 * executeScriptConsoleLog() - chạy console.log() trên tab đang chạy extension
 * @param tabId tabId muốn chạy console.log()
 * @param content nội dung
 * @returns void
 */
function consoleLogExecuteOnPage(tabId, content = "nothing") {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: () => {
      console.log(content);
    },
  });
}

/**
 * chrome.tabs.query() - lấy ra cái tab đang gọi extension, (sau đó gọi callback function)
 * Gets all tabs that have the specified properties, or all tabs if no properties are specified.
 * @param queryInfo:object
 * @returns Promise<Tab[]>
 */
async function getCurrentTabId() {
  return chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }).then((tabsArray) => {
    //promise fulfilled
    return tabsArray[0].id;
  });
}

/**
 * lấy ra id của bài nộp nếu đang ở tab my submission
 * @param tabId tab đang mở my submission
 * @returns String: id của bài nộp
 *
 * chrome.scripting.executeScript() - chạy injection (tabId và callback)
 * Injects JavaScript code into a page
 * @param injection: ScriptInjection
 * @returns Promise<any>
 */
async function getSubmissionID(tabId) {
  str = new String("Hello");
  return chrome.scripting
    .executeScript({
      target: { tabId }, //target: tab sẽ chạy script, //function: callback function đc gọi
      function: () => {
        return document.querySelectorAll('[placeholder="Share your thoughts..."]')[0].id.match(/.*(?=~comment)/)[0];
      }, //@returns Promise<String[]>
    })
    .then((item) => {
      //promise fulfilled
      return item[0].result;
    });
}

// ====================== MAIN ======================
async function main() {
  console.log("bắt đầu nè");

  let submissionID = ""; //id của bài nộp
  let tabId; //id của tab gọi extension

  tabId = await getCurrentTabId();
  console.log("tabId đag chạy extension nè: ", tabId);

  submissionID = await getSubmissionID(tabId);
  console.log("submissionID nè: ", submissionID);
  consoleLogExecuteOnPage(tabId, submissionID);

  // hiển thị link
  displayLink(submissionID, tabId);

  // document.getElementById("yourButtonId").addEventListener("click", function () {
  //   // Call your function here
  //   run();

  //   // Copy content to clipboard
  //   copyToClipboard(document.getElementById("yourElementId"));
  // });

  window.onload = function () {
    "use strict";
    function copyToClipboard(elem) {
      var target = elem;

      // select the content
      var currentFocus = document.activeElement;

      target.focus();
      target.setSelectionRange(0, target.value.length);

      // copy the selection
      var succeed;

      try {
        succeed = document.execCommand("copy");
      } catch (e) {
        console.warn(e);

        succeed = false;
      }

      // Restore original focus
      if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
      }

      if (succeed) {
        document.getElementsByClassName("copied")[0].style.display = "inline";
      }

      return succeed;
    }

    document.getElementById("copyButton").addEventListener("click", function () {
      copyToClipboard(document.getElementById("shareLink"));
    });
    document.getElementById("shareLink").addEventListener("click", function () {
      copyToClipboard(document.getElementById("shareLink"));
    });
    // console.log(document.querySelector("#shareLink"));
    // $("#copyButton, #shareLink").on("click", function () {
    //   copyToClipboard(document.getElementById("shareLink"));
    // });
  };
}

main();
