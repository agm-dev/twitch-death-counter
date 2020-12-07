const STORAGE_KEY = "twitch-death-counter";
const COMMAND_ID = "!muerte ";
const FIX_COMMAND_ID = "!fixmuerte";
const RESET_COMMAND_ID = "!resetdeathcounter";
const SHOW_HISTORY = "!showdeathhistory";
const HIDE_HISTORY = "!hidedeathhistory";
const CHANNEL = "g0ldstripes_";
const HISTORY_CLASS = "history";

const data = {
  total: 0,
  history: [],
};

let displayHistory = false;

const load = () => {
  console.log("DEBUG loading saved data");

  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    const savedData = rawData ? JSON.parse(rawData) : { ...data };
    data.history = [...savedData.history];
    data.total = data.history.length;
    updateDisplay(data.total);
  } catch (error) {
    console.error("DEBUG error on loading data", error);
  }
};

const updateDisplay = number => {
  document.querySelector(".counter__total").innerText = number;
  if (displayHistory) {
    showHistory();
  }
}

const updateAndSave = data => {
  try {
    updateDisplay(data.total);
    const newSave = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, newSave);
  } catch (error) {
    console.error("DEBUG error on updating data", error);
  }
};

const update = (description = "") => {
  console.log("DEBUG updating death counter", description);

  data.history.push({
    description,
    at: Date.now(),
  });
  data.total = data.history.length;

  updateAndSave(data);
};

const fix = () => {
  console.log("DEBUG fixing death counter, removing last entry");

  data.history.pop();
  data.total = data.history.length;

  updateAndSave(data);
};

const reset = () => {
  data.history = [];
  data.total = data.history.length;

  updateAndSave(data);
};

const showHistory = () => {
  try {
    hideHistory();

    const table = document.createElement("table");
    const thNum = document.createElement("th");
    const thDate = document.createElement("th");
    const thDescription = document.createElement("th");
    const tr = document.createElement("tr");

    thNum.innerText = "Num";
    thDate.innerText = "Fecha";
    thDescription.innerText = "Motivo";

    tr.appendChild(thNum);
    tr.appendChild(thDate);
    tr.appendChild(thDescription);

    table.appendChild(tr);

    data.history.forEach((item, index) => {
      const row = document.createElement("tr");
      const num = document.createElement("td");
      const date = document.createElement("td");
      const reason = document.createElement("td");

      num.innerText = index + 1;
      const dateText = (new Date(item.at)).toLocaleDateString("es-ES").split("/").reverse().join("-");
      const timeText = (new Date(item.at)).toLocaleTimeString();
      date.innerText = `${dateText} ${timeText}`;
      reason.innerText = item.description;

      row.appendChild(num);
      row.appendChild(date);
      row.appendChild(reason);

      table.appendChild(row);
      displayHistory = true;
    });

    const el = document.createElement("div");
    el.classList.add("history");
    el.appendChild(table);
    document.querySelector("body").appendChild(el);
  } catch (error) {
    console.log("DEBUG error on showing history");
  }
};

const hideHistory = () => {
  try {
    document.querySelector(".history").remove();
    displayHistory = false;
  } catch (error) {
    console.log("DEBUG error on hiding history", error);
  }
};

const isAddCommand = message => message.startsWith(COMMAND_ID);

const isFixCommand = message => message.startsWith(FIX_COMMAND_ID);

const isResetCounter = message => message.startsWith(RESET_COMMAND_ID);

const isShowHistory = message => message.startsWith(SHOW_HISTORY);

const isHideHistory = message => message.startsWith(HIDE_HISTORY);

const isAdmin = username => username === CHANNEL;

const init = () => {
  console.log("DEBUG init!");

  load();

  const client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true
    },
    channels: [ CHANNEL ]
  });

  client.connect();

  client.on('message', (channel, tags, message, self) => {
    const { username, mod, subscriber } = tags;
    if (!isAdmin(username)) {
      return;
    }

    if (isAddCommand(message)) {
      const description = message.replace(COMMAND_ID, "");
      update(description);
      return;
    }

    if (isFixCommand(message)) {
      fix();
      return;
    }

    if (isResetCounter(message)) {
      reset();
    }

    if (isShowHistory(message)) {
      showHistory();
      return;
    }

    if (isHideHistory(message)) {
      hideHistory();
      return;
    }
  });
};

// main:
document.addEventListener("DOMContentLoaded", init);
