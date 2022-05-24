import {
    getDocs,
    query,
    onSnapshot,
    doc,
    setDoc,
    addDoc,
    getFirestore,
    Timestamp,
    updateDoc,
    collection,
    where,
} from "firebase/firestore";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import Review, { auth } from "./firebase.js";

const readableDate = (date) => {
    var dateString = date.toString();
    var dateArr = dateString.split(" ");
    console.log(dateArr);
    var date = `${dateArr[1]} ${dateArr[2]}, ${dateArr[3]}`;
    var timeArr = dateArr[4].substring(0, 5).split(":");
    var subscript = timeArr[0] < 12 ? "AM" : "PM";
    var hourNum = (timeArr[0] % 12 < 10 ? "0" : "") + (timeArr[0] % 12);
    var time = `${hourNum}:${timeArr[1]}`;
    return `${time} ${subscript} -- ${date}`;
};

export async function createReview(review) {
    review.id = "id" + new Date().getTime();
    const db = getFirestore();
    try {
        await setDoc(doc(db, "reviews", review.id), {
            id: review.id,
            title: review.title,
            body: review.body,
            rating: review.rating,
            diningHall: review.diningHall,
            user: review.name,
            uid: review.uid,
            createdAt: readableDate(Timestamp.now().toDate()),
        });
        return true;
    } catch (error) {
        console.log(error);
    }
}

export async function getReviews() {
    const db = getFirestore();
    const reviews = [];
    const querySnapshot = await getDocs(collection(db, "reviews"));
    querySnapshot.forEach((doc) => {
        reviews.push(
            new Review(
                doc.data().title,
                doc.data().body,
                doc.data().rating,
                doc.data().user,
                doc.data().createdAt,
                doc.data().diningHall
            )
        );
    });
    return reviews;
}

export async function getUserReviews(uid) {
    const db = getFirestore();
    const reviews = [];
    const querySnapshot = await getDocs(collection(db, "reviews"));
    querySnapshot.forEach((doc) => {
        if (doc.data().uid === uid) {
            reviews.push(
                new Review(
                    doc.data().title,
                    doc.data().body,
                    doc.data().rating,
                    doc.data().user,
                    doc.data().createdAt,
                    doc.data().diningHall
                )
            );
        }
    });
    return reviews;
}

/* login/out functions inspired by https://blog.logrocket.com/user-authentication-firebase-react-apps/ */

export async function googleSignIn() {
    const googleProvider = new GoogleAuthProvider();
    const db = getFirestore();
    try {
        const account = await signInWithPopup(auth, googleProvider);
        const user = account.user;
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: user.displayName,
                authProvider: "google",
                email: user.email,
                bio: "",
                dining: [],
                reviews: [],
                image: user.photoURL,
                favDining1: "",
                favDining2: "",
            });
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

export async function emailSignIn(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

export async function emailRegister(name, email, password) {
    const db = getFirestore();
    try {
        const account = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = account.user;
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            authProvider: "local",
            email,
            bio: "",
            dining: [],
            reviews: [],
            image: "",
            favDining1: "",
            favDining2: "",
        });
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

export function logout() {
    console.log("signing out");
    signOut(auth);
}

export async function getUsers(uid) {
    const db = getFirestore();
    const userRef = collection(db, "users");
    var userDetails = {};
    const q = query(userRef, where("uid", "==", uid));
    const qSnapshot = await getDocs(q);
    qSnapshot.forEach((doc) => {
        userDetails = { ...doc.data() };
    });
    return userDetails;
}

export async function editBio(uid, newBio) {
    if (!newBio) {
        return;
    }
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        bio: newBio,
    });
}

export async function editUserImage(uid, newImage) {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        image: newImage,
    });
}

export async function editFavDining(uid, newDiningHall, id) {
    if (!newDiningHall) {
        return;
    }
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    if (id === 1) {
        await updateDoc(userRef, {
            favDining1: newDiningHall,
        });
    } else if (id === 2) {
        await updateDoc(userRef, {
            favDining2: newDiningHall,
        });
    }
}

export async function addReviews(uid, reviewID) {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const userDetails = getUsers(uid);
    var reviewArr = userDetails.reviews;
    reviewArr.push(reviewID);
    await updateDoc(userRef, {
        reviews: reviewArr,
    });
}
