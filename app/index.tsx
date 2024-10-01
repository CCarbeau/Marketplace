import { Redirect } from "expo-router"

console.log("Home component is rendering");

const Index = () => {
  return (
    <Redirect href='/(auth)/sellerSignUp'></Redirect>
  )
}

export default Index