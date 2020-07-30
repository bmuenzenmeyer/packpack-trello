const fetch = require('node-fetch');

// Get any environment variables we need
// With public fallbacks for happier onboarding
require('dotenv').config();

const {
  TRELLO_BOARD_ID,
  TRELLO_API_BOARD_CARDS,
  TRELLO_LIST_ID,
  TRELLO_TOKEN,
  TRELLO_KEY,
  BRANCH } = process.env;

const trelloBoardCardsUrl = TRELLO_API_BOARD_CARDS.replace('TRELLO_BOARD_ID', TRELLO_BOARD_ID)

module.exports = () => {

  // Fetch the JSON data about this board
  return fetch(`${trelloBoardCardsUrl}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`)
    .then(res => res.json())
    .then(json => {

      // Just focus on the cards which are in the list we want
      // and do not have a closed status
      let contentCards = json.filter(card => {
        return card.idList == TRELLO_LIST_ID && !card.closed;
      });

      // only include cards labelled with "live" or with
      // the name of the branch we are in
      let contextCards = contentCards.filter(card => {
        return card.labels.filter(label => (
          label.name.toLowerCase() == 'live' ||
          label.name.toLowerCase() == BRANCH
        )).length;
      });

      // If a card has an attachment, add it as an image in the descriotion markdown
      contextCards.forEach(card => {
        if(card.attachments && card.attachments.length) {
          card.name = "";
          card.desc = card.desc + `\n![${card.name}](${card.attachments[0].url} '${card.name}')`;
        }
      })

      // return our data
      return contextCards;
  });
};
