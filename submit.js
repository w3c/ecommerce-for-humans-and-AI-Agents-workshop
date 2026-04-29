/*jshint esversion: 6 */
(() => {
    const button = document.querySelector('#submit-button');
    if (button) addSubmitButtonListener();

    function addSubmitButtonListener() {
        document.querySelector('#submit-button').onclick = () => {
            alert('Participation details are still to be confirmed.');
        };
    }
})();
  
