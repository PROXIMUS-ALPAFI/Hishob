
import Header from './header'
import Footer from './footer'
import '../../index.css'

const Layout = ({children}) => {
  return (
    <>
       <Header/>
       <div className='content'>
            {children}
       </div>
       <Footer/>
    </>
  )
}

export default Layout