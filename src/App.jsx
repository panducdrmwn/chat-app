import { useRef, useState } from 'react'
// import "./app.css"
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
    
      <div className='m-auto text-center max-w-3xl'>
        <header className='bg-teal-900 h-[10vh] min-h-[50px] text-white fixed w-full max-w-3xl top-0 flex items-center justify-between z-[99] p-[10px] box-border'>
          <h1>⚛️🔥💬</h1>
          <SignOut />
        </header>
        <section className='bg-neutral-800 flex flex-col justify-center min-h-[100vh]'>
        {user ? <ChatRoom/> : <SignIn/>}
        </section>
     </div>
    
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
    <button className='p-2 rounded-2xl bg-blue-700 max-w-2xl items-centers self-center' onClick={signMeIn}>Sign In</button>
  )

}

function SignOut (){
  return auth.currentUser && (
    <button className='bg-red-600 p-4 rounded-2xl' onClick={()=> auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const messageRef = collection(db, "messages")
  const q = query(messageRef,orderBy('createdAt'));
  const [messages] =  useCollectionData(q, {idField: 'id'});
  const scrolldown = useRef()

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
    scrolldown.current.scrollIntoView({ behavior:'smooth' });
  }
  
  return(
    <>
      <div>
        {
          messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)
        }

        <div ref={scrolldown}></div>
        <form className='h-[10vh] fixed bottom-0 w-full max-w-3xl flex  bg-gray-700' onSubmit={sendMessage}>
          <input className='w-full font-medium bg-gray-700 text-white outline-0 border-0 p-0' type="text" value={formValue} onChange={(e)=> setFormValue(e.target.value)}/>
          <button className='w-[20%] rounded-l-2xl bg-emerald-600' onSubmit={sendMessage}>Send</button>
        </form>
      </div>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

  return (
    <div className={` flex items-center ${messageClass === 'sent' && 'flex-row-reverse'}`}>
      <img className='w-10 rounded-4xl my-[2px] mx-[5px]' src={photoURL} loading='lazy'/>
      <p className={`${messageClass === 'sent' ? 'bg-blue-600 p-2 rounded-2xl text-white' : 'bg-amber-50 text-black p-2 rounded-2xl'}`}>{text}</p>
    </div>
  )
}

export default App
