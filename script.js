"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

const Student = {
  first_name: "",
  last_name: "",
  middle_name: "",
  nick_name: "",
  image: "",
  house: "unknown",
  gender: "",
};

const settings = {
  filter: "all",
  sortBy: "last_name",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  loadJSON();
  // Add event-listeners to filter and sort buttons
  registerButtons();
}

function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));

  document.querySelectorAll("[data-action='sort']").forEach((button) => {
    button.addEventListener("click", selectSort);
    button.dataset.sortDirection = "asc";
  });
}

async function loadJSON() {
  const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
  const jsonData = await response.json();
  cleanData(jsonData);
  prepareObjects(jsonData);
}

function cleanData(studentData) {
  studentData.forEach((studentObject) => {
    const student = Object.create(Student);

    // Clean house data
    const house = studentObject.house.trim();
    const houseCleaned = house.charAt(0).toUpperCase() + house.slice(1).toLowerCase();
    student.house = houseCleaned;

    // Set gender to student object
    student.gender = studentObject.gender;

    // Clean name data and split it into first, middle, and last name
    const names = studentObject.fullname.trim();
    const splitName = names.split(" ");

    // Clean first name data
    const firstName = splitName[0].charAt(0).toUpperCase() + splitName[0].slice(1).toLowerCase();
    student.first_name = firstName;

    // Clean last name data
    const lastName = splitName.pop();
    let lastNameCleaned = lastName.charAt(0).toUpperCase() + lastName.slice(1);
    lastNameCleaned = lastNameCleaned
      .split("-")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("-");
    student.last_name = lastNameCleaned;

    // Clean middle name data
    let middleName = splitName.slice(1, -1).join(" ").trim();
    if (middleName.length === 0) {
      middleName = undefined;
    } else {
      middleName = middleName.charAt(0).toUpperCase() + middleName.slice(1);
    }
    student.middle_name = middleName;

    // Push student object onto allStudents array
    allStudents.push(student);
  });

  console.table(allStudents);

  displayList(allStudents);
}

function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareObject);

  // fixed so we filter and sort on the first load
  buildList();
}

function capName(string) {
  const trimstring = string.trim();
  const firstChar = trimstring.charAt(0).toUpperCase();
  const restOfString = trimstring.slice(1).toLowerCase();
  return firstChar + restOfString;
}

function prepareObject(jsonObject) {
  const student = Object.create(Student);
  const fullName = capName(jsonObject.fullname);
  const texts = fullName.split(" ");
  student.first_name = texts[0];
  student.middle_name = texts[1];
  student.last_name = capName(texts[texts.length - 1]);
  student.gender = capName(jsonObject.gender);
  student.house = capName(jsonObject.house);
  if (texts.length > 2) {
    const middle_name = texts.slice(1, texts.length - 1);
    student.middle_name = middle_name.map(capName).join(" ");
  } else if (texts.length === 2) {
    student.middle_name = null;
  }

  return student;
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`User selected ${filter}`);
  // filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  if (settings.filterBy === "Girl") {
    filteredList = allStudents.filter(isGirl);
  } else if (settings.filterBy === "Boy") {
    filteredList = allStudents.filter(isBoy);
  } else if (settings.filterBy == "Gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  } else if (settings.filterBy == "Slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  } else if (settings.filterBy == "Ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  } else if (settings.filterBy == "Hufflepuff") {
    filteredList = allStudents.filter(isHufflepuff);
  } else if (settings.filterby == "First_name") {
    filteredList = allStudents.filter(isFirst_name);
  } else if (settings.filterby == "Last_name") {
    filteredList = allStudents.filter(isLast_name);
  } else if (settings.filterby == "middle_name") {
    filteredList = allStudents.filter(isMiddle_name);
  }

  return filteredList;
}

function isGirl(student) {
  return student.gender === "Girl";
}

function isBoy(student) {
  return student.gender === "Boy";
}

function isGryffindor(student) {
  return student.house === "Gryffindor";
}

function isSlytherin(student) {
  return student.house === "Slytherin";
}

function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}

function isHufflepuff(student) {
  return student.house === "Hufflepuff";
}

function isFirst_name(student) {
  return student.names === "First_name";
}

function isLast_name(student) {
  return student.name === "Last_name";
}

function isMiddle_name(student) {
  return student.name === "Middle_name";
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  console.log("SELECTSORT sortBy", event.target);
  // find "old" sortby element, and remove .sortBy
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  // indicate active sort
  event.target.classList.add("sortby");

  // toggle the direction!
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  // let sortedList = allStudents;
  console.log("settings.sortBy", settings.sortBy);
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(student) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  student.forEach(displayStudent);
}

function showImage(firstname, lastname) {
  return `images/${lastname.toLowerCase()}_${firstname.charAt(0).toLowerCase()}.png`;
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document.querySelector("#student").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=first_name]").textContent = student.first_name;
  clone.querySelector("[data-field=middle_name]").textContent = student.middle_name;
  clone.querySelector("[data-field=last_name]").textContent = student.last_name;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=house]").textContent = student.house;

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
