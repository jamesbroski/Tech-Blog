const router = require("express").Router();
const { User } = require("../../Models");

router.post("/", (req, res) => {
  console.log("signup information", req.body);
  User.create({
    username: req.body.username,
    password: req.body.password,
  })
    .then((dbUserData) => {
      req.session.save(() => {
        req.session.userId = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
        res.json(dbUserData);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});
// /api/user/login
router.post("/login", (req, res) => {
  console.log("login information", req.body);
  User.findOne({
    where: {
      username: req.body.username,
    },
  }).then((dbUserData) => {
    if (!dbUserData) {
      console.log("bad username");
      res
        .status(400)
        .json({ message: "Please enter a valid username and password" });
      return;
    }

    const validPassword = dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      console.log("bad password");
      res
        .status(400)
        .json({ message: "Please enter a valid username and password" });
      return;
    }
    req.session.save(() => {
      req.session.userId = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json({ user: dbUserData, message: "Logged in successfully" });
    });
  });
});

router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    res.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

router.delete("/user/:id", (req, res) => {
  User.destroy({
    where: {
      id: res.params.id,
    },
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
