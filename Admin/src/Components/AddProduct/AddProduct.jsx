import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'
import { useState } from 'react'
const AddProduct = () => {
   const [image,setImg] = useState(false);
   const [productDetails,setProductDetails] = useState({
      name:'',
      image:'',
      category:'women',
      new_price:'',
      old_price:'',
      })

   const handelerImg = (e)=>{
       setImg(e.target.files[0])
   }

   const changeHandler = (e) =>{
      setProductDetails({...productDetails,[e.target.name]:e.target.value})
   }
   const Add_product = async ()=>{
            console.log(productDetails);
   }

  return (
    <div className='add-product'>
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input  value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
            </div>
            <div className="addproduct-price">
                 <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input value={productDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='type here' />
                 </div>

                 <div className="addproduct-itemfield">
                    <p>Offer  Price</p>
                    <input value={productDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='type here' />
                 </div>
            </div>

            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select  value={productDetails.category} onChange={changeHandler}  name="category"  className='addproduct-selector' id="">
                     <option value="women">Women</option>
                     <option value="men">Men</option>
                     <option value="kid">Kid</option>
                </select>
            </div>

            <div className="addproduct-itemfield">
                 <label htmlFor="file-input">
                    <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumnail-img' alt="" />
                 </label>
                 <input type="file" onChange={handelerImg} name='image' id='file-input' hidden />
            </div>
            <button  onClick={Add_product} className='addproduct-btn'> ADD</button>
    </div>
  )
}

export default AddProduct
