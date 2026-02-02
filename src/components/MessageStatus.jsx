import React from 'react'
import { Check, CheckCheck } from 'lucide-react'

const MessageStatus = ({ isOwn, isRead }) => {
    if(!isOwn) return null;
  return (
    <span className='ml-1 inline-flex' title={isRead ? 'Read' : 'Sent'}>
      {isRead ? <CheckCheck size={14} className='text-blue-400' /> : <Check size={14} className='text-slate-400' />}
    </span>
  )
}

export default MessageStatus;
