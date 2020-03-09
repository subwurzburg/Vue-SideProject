<template>
  <div>
    <loading :active.sync="isLoading"></loading>
    <div class="row mt-4">
        <div class="col-md-4 mb-4" v-for="item in products" :key="item.id" v-if="item.is_enabled==1">
            <div class="card border-0 shadow-sm">
                <div style="height: 150px; background-size: cover; background-position: center"
                    :style="{backgroundImage:`url(${item.imageUrl})`}">
                </div>
                <div class="card-body">
                    <span class="badge badge-secondary float-right ml-2">{{item.category}}</span>
                    <h5 class="card-title">
                        <a href="#" class="text-dark">{{item.title}}</a>
                    </h5>
                    <p class="card-text">{{item.content}}</p>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="h5" v-if="item.price">{{ item.origin_price }} 元</div>
                        <del class="h6" v-if="!item.price">{{ item.origin_price }}元</del>
                        <div class="h5" v-if="!item.price">現在只要{{ item.price }}元</div>
                    </div>
                </div>

                <div class="card-footer d-flex">
                    <button type="button" class="btn btn-outline-secondary btn-sm" @click="getProduct(item.id)">
                        <i class="fas fa-spinner fa-spin" v-if="status.loadingItem === item.id"></i>
                        
                        查看更多
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm ml-auto" @click = "addtoCart(item.id)">
                        <i class="fas fa-spinner fa-spin" v-if="status.loadingItem === item.id" ></i>
                        加到購物車
                    </button>
                </div>
            </div>
        </div>
    </div>
    <Pagination :pages="pagination" @emitPages="getProducts"></Pagination>
    <div class="modal fade" id="productModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">{{ product.title }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <img :src="product.imageUrl" class="img-fluid" alt="">
                    <blockquote class="blockquote mt-3">
                        <p class="mb-0">{{ product.content }}</p>
                        <footer class="blockquote-footer text-right">{{ product.description }}</footer>
                    </blockquote>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="h4" v-if="!product.price">{{ product.origin_price }} 元</div>
                        <del class="h6" v-if="product.price">原價 {{ product.origin_price }} 元</del>
                        <div class="h4" v-if="product.price">現在只要 {{ product.price }} 元</div>
                    </div>
                    <select name="" class="form-control mt-3" v-model="product.num">
                        <option :value="num" v-for="num in 10" :key="num">
                            選購 {{num}} {{product.unit}}
                        </option>
                    </select>
                </div>
                <div class="modal-footer">
                    <div class="text-muted text-nowrap mr-3">
                        小計 <strong>{{ product.num * product.price }}</strong> 元
                    </div>
                    <button type="button" class="btn btn-primary" @click = "addtoCart(product.id,product.num)">
                        <!--<i class="fas fa-spinner fa-spin" v-if="product.id === status.loadingItem"></i>-->
                        加到購物車
                    </button>
                </div>
            </div>
        </div>
    </div>
    <hr>
    <div class="my-5 row justify-content-center" v-if="OrderProduct.final_total !==0" >
        <div class="my-5 row justify-content-center">
            <table class="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>品名</th>
                        <th>數量</th>
                        <th>單價</th>
                        <th>總價</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item) in OrderProduct.carts" :key="item.id">
                        <td class="align-middle">
                            <button type="button" class="btn btn-outline-danger btn-sm" @click="removeCartItem(item.id)">
                             <i class="far fa-trash-alt"></i>
                            </button>
                        </td>
                        <td class="align-middle">
                            {{item.product.title}}
                            <div class="text-success" v-if="item.coupon">
                                已使用優惠券
                            </div>
                        </td>
                        <td class="align-middle">
                            {{item.qty}}
                        </td>
                        <td class="align-middle">
                            {{item.product.price}}
                        </td>
                        <td class="align-middle">
                            {{item.final_total}}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" class="text-right">總計</td>
                        <td class="text-right">{{ OrderProduct.total }}</td>
                    </tr>
                    <tr v-if="OrderProduct.final_total !== OrderProduct.total">
                        <td colspan="4" class="text-right text-success">折扣價</td>
                        <td class="text-right">{{OrderProduct.final_total}}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="input-group mb-3 input-group-sm">
                <input type="text" class="form-control" placeholder="請輸入優惠碼" v-model="coupon_code">
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button" @click="addCouponCode()">
                    套用優惠碼
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="my-5 row justify-content-center" v-if="OrderProduct.final_total !==0">
        <form class="col-md-6" @submit.prevent="createOrder">
            <div class="form-group">
                <label for="useremail">Email</label>
                <input type="email" class="form-control" name="email" id="useremail" v-model="form.user.email"
                    placeholder="請輸入 Email" v-validate="'required|email'" :class="{'is-invalid':errors.has('email')}">
                <span class="text-danger" v-if="errors.has('email')">{{errors.first('email')}}</span>
            </div>

            <div class="form-group">
                <label for="username">收件人姓名</label>
                <input type="text" class="form-control" name="name" id="username" v-model="form.user.name"
                    placeholder="輸入姓名" v-validate="'required'" :class="{'is-invalid':errors.has('name')}">
                <span class="text-danger" v-if="errors.has('name')">姓名必須輸入</span>
            </div>

            <div class="form-group">
                <label for="usertel">收件人手機</label>
                <input type="tel" name="tel" class="form-control" id="usertel" v-model="form.user.tel" placeholder="請輸入電話"
                    v-validate="'required|numeric|min_value:0900000000|max_value:0999999999|length:10'" :class="{'is-invalid':errors.has('tel')}">
                <span class="text-danger" v-if="errors.has('tel')">手機有誤或填寫有誤</span>
            </div>

            <div class="form-group">
                <label for="useraddress">收件人地址</label>
                <input type="text" class="form-control" name="address" id="useraddress" v-model="form.user.address"
                    placeholder="請輸入地址" v-validate="'required'" :class="{'is-invalid':errors.has('address')}">
                <span class="text-danger" v-if="errors.has('address')">地址欄位不得留空</span>
            </div>

            <div class="form-group">
                <label for="comment">留言</label>
                <textarea name="" id="comment" class="form-control" cols="30" rows="10" v-model="form.message"></textarea>
            </div>
            <div class="text-right">
                <button class="btn btn-danger">送出訂單</button>
            </div>
        </form>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import Pagination from '../Pagination'
export default {
    data(){
        return {
            products:[],
            product:{}, //取得單筆資料
            isLoading:false,
            status:{
                loadingItem:'',
            },
            form:{
                user:{
                    name:'',
                    email:'',
                    tel:'',
                    address:'',
                },
                message:'',
            },
            OrderProduct:{},
            coupon_code:'',
            pagination:'',
            Error:'',
            Test:[],
        }
    },
    components:{
        Pagination,
    },
    methods: {
        getProducts(page = 1){
            const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/products?page=${page}`
            const vm =this;
            vm.isLoading = true;
            this.$http.get(api).then((response)=>{
                console.log("Test",response.data);
                vm.products = response.data.products;
                vm.Test = vm.products.filter(function(item,index,array){
                    return item.is_enabled == 1;
                })
                console.log("vm.Test",vm.Test);
                vm.pagination = response.data.pagination;
                /*if(vm.Test.length<=10){
                    vm.pagination = {
                        total_pages:1,
                        current_page:1,
                        has_pre:false,
                        has_next:false,
                    }
                }
                else{
                    vm.pagination = response.data.pagination;
                }*/
                vm.isLoading = false;
            })
        },
        getProduct(id){
            const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/product/${id}`
            console.log('Test',api)
            const vm =this;
            vm.status.loadingItem = id;
            this.$http.get(api).then((response)=>{
                console.log(response.data);
                vm.product = response.data.product;
                console.log(vm.product);
                $('#productModal').modal('show');
                vm.status.loadingItem = '';
            })
        },
        addtoCart(id,qty = 1){
            const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/cart`
            const vm =this;
            vm.status.loadingItem = id;
            const cart = {
                product_id : id,
                qty,
            };
            this.$http.post(api,{data:cart}).then((response)=>{
                console.log(response);
                vm.status.loadingItem = '';
                vm.getCart();
                $('#productModal').modal('hide');
            })
        },
        getCart(){
            const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/cart`
            const vm =this;
            vm.isLoading = true;
            this.$http.get(api).then((response)=>{
                console.log(response.data);
                vm.OrderProduct = response.data.data;
                console.log(vm.OrderProduct);
                vm.isLoading = false;
            })
        },
        removeCartItem(id){
            const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/cart/${id}`;
            const vm = this;
            console.log(api);
            vm.isLoading = true;
            this.$http.delete(api).then(()=>{
                /*console.log(response);*/
                vm.getCart();
                vm.isLoading = false;
            })
        },
        addCouponCode(){
            const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/coupon`;
            const vm = this;
            const coupon = {
                code:vm.coupon_code
            }
            console.log(api);
            vm.isLoading = true;
            this.$http.post(api,{data:coupon}).then((response)=>{
                console.log(response);
                if(!response.data.success){
                    vm.Error = response.data.message;
                    this.$bus.$emit('messsage:push', vm.Error, 'danger');
                    console.log(vm.Error);
                }
                vm.getCart();
                vm.isLoading = false;
            })
        },
        createOrder(){
            const api = `${process.env.APIPATH}/api/${process.env.CUSTOMPATH}/order`;
            const vm = this;
            const order = vm.form;
            console.log(api);
            vm.isLoading = true;
            this.$validator.validate().then((valid) => {
                if (valid) {
                    this.$http.post(api,{data:order}).then((response)=>{
                    console.log('訂單已建立',response);
                    if(response.data.success){
                        vm.$router.push(`/customer_checkout/${response.data.orderId}`);
                    }
                    vm.isLoading = false;
                    })
                }
                else{
                    console.log('error');
                    vm.isLoading = false;
                }
            });
        }
    },
    created() {
        this.getProducts();
        this.getCart();
    },
}
</script>