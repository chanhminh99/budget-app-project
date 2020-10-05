// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    (this.id = id),
      (this.description = description),
      (this.value = value),
      (this.percentage = -1);
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    (this.id = id), (this.description = description), (this.value = value);
  };

  var calculateTotal = function (type) {
    var sum = 0;

    data.allItems[type].forEach(function (el) {
      sum += el.value;
    });

    data.totals[type] = sum;

    return sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, desc, val) {
      var newItem, ID;

      //Create new ID
      ID =
        data.allItems[type].length > 0
          ? data.allItems[type][data.allItems[type].length - 1].id + 1
          : 0;
      //Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }

      //Push it into our data structure

      data.allItems[type].push(newItem);

      // Return the new el
      return newItem;
    },

    deleteItem: function (type, id) {
      var arrayID, index;
      // id  = 3;

      arrayID = data.allItems[type].map(function (el, idx) {
        return el.id;
      });

      id = parseInt(id);
      index = arrayID.indexOf(id);

      console.log(index, arrayID);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // calculate total income and expenses

      calculateTotal("exp");
      calculateTotal("inc");

      // Calculate the budget: income - expenses

      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent

      data.percentage =
        data.totals.inc !== 0
          ? Math.round((data.totals.exp / data.totals.inc) * 100)
          : -1;
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (el) {
        el.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPercentage = data.allItems.exp.map(function (el) {
        return el.percentage;
      });

      return allPercentage;
    },

    getBudget: function () {
      // Return budget

      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// UI CONTROLLER

var UIController = (function () {
  //Some code

  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputSubmit: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percantageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentage: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    /*
      + or - before number
      exactly 2 decimal points
      comma separating the thoudsand
      */
    var numSplit;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];

    if (int.length > 3) {
      var len = int.length;
      var defaultStr = int;
      var sodu = len % 3;

      if (sodu !== 0) {
        int = defaultStr.substr(0, sodu);

        for (var i = sodu; i < len; i = i + 3) {
          int = int + "," + defaultStr.substr(i, 3);
        }
      } else if (sodu === 0) {
        int = defaultStr.substr(0, 3);
        for (var i = 3; i < len; i = i + 3) {
          int = int + "," + defaultStr.substr(i, 3);
        }
      }
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp

        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;

      //Creating HTML string with placeholder text

      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data

      newHtml = html
        .replace("%id%", obj.id)
        .replace("%description%", obj.description)
        .replace("%value%", formatNumber(obj.value, type));
      // Insert the HTML into the DOM

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    displayBudget: function (obj) {
      //
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        obj.budget > 0 ? "inc" : "exp"
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percantageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percantageLabel).textContent = "---";
      }
    },

    deleteListItem: function (selectorID) {
      var itemDel = document.getElementById(selectorID);

      itemDel.parentNode.removeChild(itemDel);
    },

    displayMonth: function () {
      var now, year, months, month;

      now = new Date();

      months = [
        "January",
        "February",
        "March",
        "Apil",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      month = now.getMonth();

      year = now.getFullYear();

      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputSubmit).classList.toggle("red");
    },

    updateListItemPercentage: function (percentanges) {
      var nodeList, listItemPercentages;

      // Get all item expenses
      nodeList = document.querySelectorAll(DOMStrings.expensesPercentage);

      console.log(nodeList);

      nodeListForEach(nodeList, function (cur, idx) {
        //Do stuff
        if (percentanges[idx] > 0) {
          cur.textContent = percentanges[idx] + "%";
        } else {
          cur.textContent = "---";
        }
      });

      // listItemPercentages = Array.prototype.slice.call(nodeList);

      //  console.log(listItemPercentages, percentanges);
      // listItemPercentages.forEach(function (el, idx) {
      //   el.textContent = percentanges[idx];
      // });
    },

    clearFields: function () {
      var fields, fieldArray;

      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      fieldArray = Array.prototype.slice.call(fields);

      fieldArray.forEach(function (el) {
        el.value = "";
      });

      fieldArray[0].focus();
    },

    getDOMstrings: function () {
      return DOMStrings;
    },
  };
})();

// GLOBAL APP CONTROLLER

var controller = (function (budgetCtrl, UICtrl) {
  // Set up Event
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMstrings();

    document
      .querySelector(DOM.inputSubmit)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        console.log("Enter was pressed");
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    // 1. Calculate the budget

    budgetCtrl.calculateBudget();

    // 2. Return the budget

    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI

    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1. Calculate percentages

    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller

    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.updateListItemPercentage(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get the field input data

    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller

      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI

      UICtrl.addListItem(newItem, input.type);

      // 4 Clear the fields

      UICtrl.clearFields();

      // 5.Update the budget

      updateBudget();

      // 6. Update percentages

      updatePercentages();

      // test
    }
  };

  var ctrlDeleteItem = function (event) {
    //Know what the target element: Where the target element fired

    var itemID, splitID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      id = splitID[1];

      //1. Delete the item from the data structure

      budgetCtrl.deleteItem(type, id);

      //2. Delte the item from the UI\\

      UICtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. Update percentages

      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started.");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

// Invoked

controller.init();
