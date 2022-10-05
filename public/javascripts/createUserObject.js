function createUserObject(obj) {
  const { 
    _id, 
    first_name, 
    last_name, 
    username, 
    birth_date, 
    photo, 
    friends, 
    incoming_friends_requests, 
    outcoming_friends_requests 
  } = obj;

  return { 
    _id, 
    first_name, 
    last_name, 
    username, 
    birth_date, 
    photo, 
    friends, 
    incoming_friends_requests, 
    outcoming_friends_requests 
  }
}

module.exports = createUserObject;