import React, { useState } from 'react'
import './App.css'
import EVENT from "./api/calendar_meeting.json";
import EVENTS from "./api/calendarfromtoenddate.json";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"
import { Tooltip } from 'react-tooltip';
import { format } from 'date-fns';
import Modal from 'react-modal';
import { MdDeleteOutline } from "react-icons/md";
import { RiEditFill } from "react-icons/ri";

const EventItem = ({ eventItem, handleEventItemClick }) => {
  function handleClick(e, eventItem) {
    e.preventDefault();
    e.stopPropagation();
    handleEventItemClick(eventItem);
    // console.log('test function', params);
  }
  function handleEdit(id) {
    console.log(id);
  }
  function handleDelete(id) {
    console.log(id);
    const deleteById = EVENTS.filter(item => item.id !== id);
    console.log(deleteById);
    console.log(EVENTS);
  }
  console.log(eventItem);

  const start = new Date(eventItem.start)
  const end = new Date(eventItem.end)
  const dateString = format(start, 'dd MMM yyyy')
  const timeStringStart = format(start, 'HH:mm ')
  const timeStringEnd = format(end, 'HH:mm')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'end', zIndex: 999, marginRight: '10px' }}>
        <div style={{ marginRight: '3px', color: 'green', cursor: 'pointer' }} onClick={() => handleEdit(eventItem.id)}><RiEditFill /></div>
        <div style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDelete(eventItem.id)}><MdDeleteOutline /></div>
      </div>
      <div className={'single-event-item'} onClick={(e) => handleClick(e, eventItem)} style={{cursor: 'pointer'}}>
        <div className='single-event-job-request'>
          {eventItem.job_id.jobRequest_Title}
        </div>
        <div className='single-event-user'>
          {eventItem.summary} | Interviewer: {eventItem.user_det.handled_by.firstName}
        </div>
        <div className='single-event-user'>
          Date: {dateString} | Time: {timeStringStart} - {timeStringEnd}
        </div>
      </div>
    </div>

  )
}

const EventsCollection = ({ events, handleEventItemClick }) => {
  return (
    <div>
      {events.map((event, index) => <EventItem key={index} eventItem={event} handleEventItemClick={handleEventItemClick} />)}
    </div>
  )
}
function App() {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [eventItem, setEventItem] = useState(null);

  function handleEventItemClick(eventItem) {

    const start = new Date(eventItem.start)
    const end = new Date(eventItem.end)
    const dateString = format(start, 'dd MMM yyyy')
    const timeStringStart = format(start, 'HH:mm a..aa')
    const timeStringEnd = format(end, 'HH:mm a..aa')
    const data = {
      candidate: eventItem.user_det.candidate.candidate_firstName,
      position: eventItem.user_det.job_id.jobRequest_Title,
      date: dateString,
      time: `${timeStringStart} - ${timeStringEnd}`,
      url: eventItem.link,
      createdBy: eventItem.user_det.handled_by.firstName
    }
    setEventItem(data);
    openModal();
  }
  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }

  const eventMap = {};
  EVENTS.forEach((item) => {
    const itemDate = new Date(item.start);
    const dateString = `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}-${itemDate.getDate()}`;
    if (!eventMap.hasOwnProperty(dateString)) {
      eventMap[dateString] = {
        title: item.summary,
        start: new Date(itemDate),
        end: new Date(item.end),
        text: item.desc,
        extendedProps: {
          events: [
            item
          ]
        }
      };
    } else {
      eventMap[dateString].extendedProps.events.push(item)
    }
  });
  const calendarEvents = Object.values(eventMap);
  const calendarEventss = EVENTS.map((item) => {
    const itemDate = new Date(item.start);
    return {
      id: item.id,
      title: item.summary,
      start: new Date(itemDate),
      end: new Date(item.end),
      text: item.desc,
      extendedProps: { ...item },
      groupId: `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}-${itemDate.getDate()}`,
    }
  })

  function renderEventContent(eventInfo) {
    const items = eventInfo.event._def.extendedProps.events[0];
    const length = eventInfo.event._def.extendedProps.events.length
    const jobTitle = items.job_id.jobRequest_Title;
    const interviewer = items.user_det.handled_by.firstName
    const startDate = new Date(items.start)
    const endDate = new Date(items.end)
    const time = `${formatTime(startDate)} - ${formatTime(endDate)}`
    const startDateAll = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`

    function formatTime(date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      let strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }
    return (
      <>
        <Tooltip
          id={`my-tooltip-click-${startDateAll}`}
          events={['click']}
          data-tooltip-place='right'
          className='customTooltip'
          closeEvents={{ click: false }}
        // afterHide={()=>handleEventItemClick(eventInfo)}
        >
          <EventsCollection events={eventInfo.event._def.extendedProps.events} handleEventItemClick={handleEventItemClick} />
        </Tooltip>
        <div className='eventBox' data-tooltip-id={`my-tooltip-click-${startDateAll}`} style={{ color: '#000', backgroundColor: "#fff", borderLeft: "15px solid blue", borderRadius: "3px", boxShadow: "rgb(0 0 0 / 67%) 0px 2px 25px", padding: "8px", height: 'auto', width: '-webkit-fill-available', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>{length > 1 && <span className='notifi'>{length}</span>}{jobTitle} <br></br> Interviewer: {interviewer}<br></br> Time: {time}</div>
      </>
    )
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        // weekends={false}
        events={calendarEvents}
        eventContent={renderEventContent}
        headerToolbar={{
          left: `prev,next today`,
          center: "title",
          right: "timeGridDay,timeGridWeek,dayGridMonth,dayGridYear",
        }}
        title={{ year: 'numeric', month: 'long' }}
        height={'90vh'}
      />

      {eventItem
        && <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Example Modal"
          style={{
            overlay: {
              backgroundColor: '#808080b5'
            },
            content: {
              color: '#000'
            },
            width: '40%',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'end' }}><button style={{ backgroundColor: 'blue', borderRadius: '50%', padding: '10px', color: '#fff', border: 'none' }} onClick={closeModal}>X</button></div>
          <div className={'single-event-model'}>
            <div className='single-event-model-wrapper'>
              <div className='modal-left'>
                <p>Interview With: {eventItem.candidate}</p>
                <p>Position: {eventItem.position}</p>
                <p>Created By: {eventItem.createdBy}</p>
                <p>Interview Date: {eventItem.date}</p>
                <p>Interview Time: {eventItem.time}</p>
                <p> Inertview viaL Google Meet</p>
                <button className='button--resume btn-primary'> Resume.docx</button><br></br>
                <button className='button--adhar btn-primary'> AadharCard</button>
              </div>
              <div className='model-right'>
                <div>
                  <img src='./google-meet-logo.png'></img>
                </div>
                <button className='btn btn-primary' onClick={() => window.open(`${eventItem.url}`, '_blank')}> Join</button>
              </div>
            </div>
          </div>
        </Modal>
      }
    </>
  )
}


export default App;