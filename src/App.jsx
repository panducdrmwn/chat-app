import { useState } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/firestore'
import 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore, query, orderBy, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'


const firebaseConfig = ({
  apiKey: "AIzaSyBgN_1EWyoTjXXVbbqowhnyF-DVJMdpyts",
  authDomain: "chat-app-7eab5.firebaseapp.com",
  projectId: "chat-app-7eab5",
  storageBucket: "chat-app-7eab5.firebasestorage.app",
  messagingSenderId: "1060812060594",
  appId: "1:1060812060594:web:25b12fa639643e277e16ab",
  measurementId: "G-SP59S6HD0S"
})

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth =  getAuth();
const db = getFirestore(app);


function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      <div>
        {user ? <ChatRoom/> : <SignIn/>}
     </div>
    </>
  )
}

function SignIn() {
 async function signMeIn ()  {
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
  } catch (error) {
    console.log(error)
  }
}

  return (
    <button onClick={signMeIn}>Sign In</button>
  )

}

function SignOut (){
  return auth.currentUser && (
    <button onClick={()=> auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const messageRef = collection(db, "messages")
  const q = query(messageRef,orderBy('createdAt'));
  const [messages] =  useCollectionData(q, {idField: 'id'});

  const [formValue, setFormValue] =  useState('')

  const sendMessage = async (e) =>{
    e.preventDefault();
    const {uid, photoURL}= auth.currentUser;

    await addDoc(messageRef,{
      text:formValue,
      createdAt: serverTimestamp() || null,
      uid,
      photoURL
    })

    setFormValue('')
  }
  
  return(
    <>
      <div>
        {
          messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)
        }

        <form onSubmit={sendMessage}>
          <input type="text" value={formValue} onChange={(e)=> setFormValue(e.target.value)}/>
          <button onSubmit={sendMessage}>Send</button>
        </form>
      </div>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}/>
      <p>{text}</p>
    </div>
  )
}

export default App
