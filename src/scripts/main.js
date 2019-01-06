// const warmupDisplay = document.querySelector(".warmup");
// const workoutDisplay = document.querySelector(".workout");
// const cardioDisplay = document.querySelector(".cardio");

// const tableHeaders = Object.keys(WorkOuts.sessions[0].warmup[0])
//   .map(key => `<td>${key}</td>`)
//   .join("");
// console.log(tableHeaders);

// const daWarmUp = WorkOuts.sessions[0].warmup
//   .map(warmup => {
//     return `<tr>
//     <td>${warmup.order}</td>
//     <td>${warmup.name}</td>
//     ${warmup.desc ? `<td>${warmup.desc}` : ""}
//     <td>${warmup.sets}</td>
//     <td>${warmup.reps}</td>
//     <td>${warmup.rest}</td>
//     <td>${warmup.duration}</td>
//   </tr>`;
//   })
//   .join("");

// warmupDisplay.innerHTML = `<th>${tableHeaders}</th>${daWarmUp}`;

const Workout = Vue.component("Workout", {
  template: "#workoutTemplate",
  props: ["title", "headings", "workouts", "columns"],
});

new Vue({
  el: ".app",
  components: {
    Workout: Workout,
  },
  data: {
    warmup: WorkOuts.sessions[0].warmup,
    workout: WorkOuts.sessions[0].workout,
    cardio: WorkOuts.sessions[0].cardio,
  },
  computed: {
    columns: function() {
      return Object.keys(this.warmup[0]);
    },
  },
});
