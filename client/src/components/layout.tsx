import React from "react"


const Layout = ({ children }) => {
    return  (
        <div className='min-h-screen flex flex-col items-center justify-center py-2'>
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                {children}
            </main>
        </div>
    )
}

export default Layout