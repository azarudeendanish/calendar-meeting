import React, { useState } from 'react'
import './App.css'
import EVENT from "./api/calendar_meeting.json";
import EVENTS from "./api/calendarfromtoenddate.json";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"
import { Tooltip } from 'react-tooltip';
import { format, setDate } from 'date-fns';
import Modal from 'react-modal';
import { MdDeleteOutline } from "react-icons/md";
import { RiEditFill } from "react-icons/ri";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaEye } from "react-icons/fa";


const EventItem = ({ eventItem, handleEventItemClick }) => {
  function handleClick(e, eventItem, eventType) {
    e.preventDefault();
    e.stopPropagation();
    handleEventItemClick(eventItem, eventType);
  }

  console.log(eventItem);

  const start = new Date(eventItem.start)
  const end = new Date(eventItem.end)
  const dateString = format(start, 'dd MMM yyyy')
  const timeStringStart = format(start, 'HH:mm a')
  const timeStringEnd = format(end, 'HH:mm a')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'end', zIndex: 999, marginRight: '10px' }}>
        <div style={{ marginRight: '3px', color: 'green', cursor: 'pointer' }} onClick={(e) => handleClick(e, eventItem, 'open_edit')}><RiEditFill /></div>
        <div style={{ color: 'red', cursor: 'pointer' }} onClick={(e) => handleClick(e, eventItem, 'delete')}><MdDeleteOutline /></div>
      </div>
      <div className={'single-event-item'} onClick={(e) => handleClick(e, eventItem, 'open')} style={{ cursor: 'pointer' }}>
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
  const [editModalIsOpen, setEditIsOpen] = useState(false);
  const [eventItem, setEventItem] = useState(null);
  const [events, setEvents] = useState(EVENTS);

  const handleEditEvent = (updatedEvent) => {
    const updatedEvents = events.map((event) => event.id === updatedEvent.id ? updatedEvent : event);
    setEvents([...updatedEvents])
  };

  const handleDeleteEvent = (item) => {
    const filteredEvents = events.filter((event) => event.id !== item.id);
    setEvents([...filteredEvents]);
  };
  function handleEventItemClick(eventItem, eventType) {
    if (eventType === 'open_edit') {
      let startDate = new Date(eventItem.start)
      let start = startDate.setDate(startDate.getDate() + 1)
      let endDate = new Date(eventItem.end)
      let end = endDate.setDate(endDate.getDate() + 1)
      // handleEditEvent({ ...eventItem , start: "2025-03-20T18:00:00+05:30",  end: "2025-03-20T18:40:00+05:30" })
      handleEditEvent({ ...eventItem, start, end })
    } else if (eventType === 'delete') {
      handleDeleteEvent(eventItem);
    } else {
      const start = new Date(eventItem.start)
      const end = new Date(eventItem.end)
      const dateString = format(start, 'dd MMM yyyy')
      const timeStringStart = format(start, 'HH:mm a')
      const timeStringEnd = format(end, 'HH:mm a')
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
  }
  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }

  const eventMap = {};
  events.forEach((item) => {
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
        {length > 1 ?
        <div className='eventBox' data-tooltip-id={`my-tooltip-click-${startDateAll}`} style={{ color: '#000', backgroundColor: "#fff", borderLeft: "15px solid blue", borderRadius: "3px", boxShadow: "rgb(0 0 0 / 67%) 0px 2px 25px", padding: "8px", height: 'auto', width: '-webkit-fill-available', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>{length > 1 && <span className='notifi'>{length}</span>}{jobTitle} <br></br> Interviewer: {interviewer}<br></br> Time: {time}</div>
        :
        <div className='eventBox' onClick={(e)=>handleEventItemClick(items,'open')} style={{ color: '#000', backgroundColor: "#fff", borderLeft: "15px solid blue", borderRadius: "3px", boxShadow: "rgb(0 0 0 / 67%) 0px 2px 25px", padding: "8px", height: 'auto', width: '-webkit-fill-available', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>{length > 1 && <span className='notifi'>{length}</span>}{jobTitle} <br></br> Interviewer: {interviewer}<br></br> Time: {time}</div>
        }
        {/* <div className='eventBox' data-tooltip-id={`my-tooltip-click-${startDateAll}`} style={{ color: '#000', backgroundColor: "#fff", borderLeft: "15px solid blue", borderRadius: "3px", boxShadow: "rgb(0 0 0 / 67%) 0px 2px 25px", padding: "8px", height: 'auto', width: '-webkit-fill-available', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>{length > 1 && <span className='notifi'>{length}</span>}{jobTitle} <br></br> Interviewer: {interviewer}<br></br> Time: {time}</div> */}
      </>
    )
  }
  function adjustSlotHeight() {
    setTimeout(() => {
      let timeSlots = document.querySelectorAll(".fc-timegrid-slot");
      let events = document.querySelectorAll(".fc-event");

      // Reset to default height
      timeSlots.forEach(slot => (slot.style.height = "40px")); 

      events.forEach(event => {
          let eventStart = new Date(event.getAttribute("data-start"));
          let eventEnd = new Date(event.getAttribute("data-end"));
          let durationInMinutes = (eventEnd - eventStart) / 60000;

          let slotHeight = 40; // Default slot height
          let requiredHeight = (durationInMinutes / 30) * slotHeight;

          event.style.height = `${requiredHeight}px`;
      });

      // Auto-adjust FullCalendar height
      let calendarWrapper = document.querySelector(".fc-timegrid-body");
      if (calendarWrapper) {
          calendarWrapper.style.height = "auto";
      }
  }, 100);
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
        expandRows= {'true'}
        slotHeight =  {100}
        eventDidMount = {adjustSlotHeight()}
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
            width: '40%', boxShadow: '0px 0px 30px 10px grey'
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
                <button className='button--resume btn-primary-outline'> Resume.docx <FaEye /> <MdOutlineFileDownload /></button>
                <button className='button--adhar btn-primary-outline'> AadharCard <FaEye /> <MdOutlineFileDownload /> </button>
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