const myReviewsFixtures = {
    oneReview: [
      {
        id: 1,
        item: "Sandwich",
        station: "Entree",
        stars: "*****",
        review: "soggy",
        status: "Awaiting Moderation",
        moderatorComments: ""
      },
    ],
  
    threeReviews: [
        {
            id: 1,
            item: "Sandwich",
            station: "Entree",
            stars: "*****",
            review: "soggy",
            status: "Awaiting Moderation",
            moderatorComments: ""
        },
  
        {
            id: 2,
            item: "Lasagna",
            station: "Entree",
            stars: "***",
            review: "Not bad",
            status: "Approved",
            moderatorComments: "Ok"
        },
  
        {
            id: 3,
            item: "Chicken Salad",
            station: "Specials",
            stars: "*",
            review: "Vote me for AS president!",
            status: "Rejected",
            moderatorComments: "Spam"
        },
    ],
  };
  
  export { myReviewsFixtures };