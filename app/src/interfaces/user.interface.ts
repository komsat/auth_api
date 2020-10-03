interface User {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    password: string;
    access_token: string;
    address?: {
      street: string,
      city: string,
    };
    sessionInfo?: {
      id: string,
      created: string,
      user_agent: string
    },
  }

  export default User;